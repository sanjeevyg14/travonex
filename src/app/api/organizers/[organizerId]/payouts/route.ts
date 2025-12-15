import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifyOrganizer } from "@/lib/auth/verify-session";
import type { ProcessedBatch } from "@/lib/types";

// GET /api/organizers/[organizerId]/payouts - Get organizer's settlements/payouts
export async function GET(
  req: NextRequest,
  { params }: { params: { organizerId: string } }
) {
  try {
    const orgResult = await verifyOrganizer();
    if (orgResult instanceof NextResponse) {
      return orgResult;
    }

    const { organizerId } = params;

    // Verify organizer owns this account
    if (orgResult.organizerId !== organizerId && orgResult.user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Access denied" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    // Fetch all bookings for this organizer
    const bookingsQuery = adminDb
      .collection("bookings")
      .where("organizerId", "==", organizerId);

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

      // Get commission rate from organizer (default 10%)
      const organizerDoc = await adminDb
        .collection("organizers")
        .doc(organizerId)
        .get();
      const commissionRate = organizerDoc.data()?.commissionRate || 10;
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
        organizerId,
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

    return NextResponse.json(
      { settlements: filteredSettlements },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Get organizer payouts error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch payouts" },
      { status: 500 }
    );
  }
}

