import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifyAdmin } from "@/lib/auth/admin-guard";
import type { ProcessedBatch } from "@/lib/types";

// GET /api/admin/settlements - Get processed batches for settlements (admin only)
export async function GET(req: NextRequest) {
  try {
    const adminResult = await verifyAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { searchParams } = new URL(req.url);
    const organizerId = searchParams.get("organizerId");
    const status = searchParams.get("status");

    // Fetch all bookings
    let bookingsQuery = adminDb.collection("bookings");
    if (organizerId) {
      bookingsQuery = bookingsQuery.where("organizerId", "==", organizerId);
    }

    const bookingsSnapshot = await bookingsQuery.get();
    const bookings = bookingsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Fetch trips to get batch end dates
    const tripIds = [...new Set(bookings.map((b: any) => b.tripId))];
    const tripsMap = new Map();

    for (const tripId of tripIds) {
      const tripDoc = await adminDb.collection("trips").doc(tripId).get();
      if (tripDoc.exists) {
        tripsMap.set(tripId, tripDoc.data());
      }
    }

    // Group bookings by trip and batch
    const batchMap = new Map<string, any>();

    for (const booking of bookings) {
      const tripData = tripsMap.get((booking as any).tripId);
      if (!tripData) continue;

      const batches = tripData.batches || [];
      const batch = batches.find((b: any) => b.id === (booking as any).batchId);
      if (!batch) continue;

      const batchKey = `${(booking as any).tripId}::${(booking as any).batchId}`;

      if (!batchMap.has(batchKey)) {
        batchMap.set(batchKey, {
          id: batchKey,
          tripId: (booking as any).tripId,
          batchId: (booking as any).batchId,
          tripTitle: tripData.title || "",
          batchEndDate: batch.endDate,
          organizerId: tripData.organizer?.id || "",
          organizerName: tripData.organizer?.name || "",
          bookings: [],
        });
      }

      batchMap.get(batchKey).bookings.push(booking);
    }

    // Process each batch
    const settlements: ProcessedBatch[] = [];

    for (const [key, batchData] of batchMap) {
      // Only process batches that have ended
      if (new Date(batchData.batchEndDate) > new Date()) {
        continue;
      }

      const successfulBookings = batchData.bookings.filter(
        (b: any) => b.paymentStatus === "Paid in Full"
      );
      const cancelledBookings = batchData.bookings.filter(
        (b: any) => b.paymentStatus === "Cancelled"
      );

      const grossRevenue = batchData.bookings.reduce(
        (sum: number, b: any) => sum + (b.amountPaid || 0),
        0
      );
      const successfulRevenue = successfulBookings.reduce(
        (sum: number, b: any) => sum + (b.totalPrice || 0),
        0
      );

      // Get commission rate (default 10%)
      const commissionRate = tripData.organizer?.commissionRate || 10;
      const commission = (successfulRevenue * commissionRate) / 100;
      const netEarning = successfulRevenue - commission;

      settlements.push({
        id: key,
        tripTitle: batchData.tripTitle,
        batchEndDate: batchData.batchEndDate,
        grossRevenue,
        commission,
        netEarning,
        status: "Available for Payout", // Can be updated based on settlement status
        successfulBookingsCount: successfulBookings.length,
        cancelledBookingsCount: cancelledBookings.length,
        successfulRevenue,
        cancellationRevenue: grossRevenue - successfulRevenue,
        organizerId: batchData.organizerId,
        organizerName: batchData.organizerName,
      });
    }

    // Filter by status if provided
    let filteredSettlements = settlements;
    if (status) {
      filteredSettlements = settlements.filter((s) => s.status === status);
    }

    // Sort by batch end date (most recent first)
    filteredSettlements.sort(
      (a, b) =>
        new Date(b.batchEndDate).getTime() -
        new Date(a.batchEndDate).getTime()
    );

    return NextResponse.json({ settlements: filteredSettlements }, { status: 200 });
  } catch (error: any) {
    console.error("Get settlements error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch settlements" },
      { status: 500 }
    );
  }
}

