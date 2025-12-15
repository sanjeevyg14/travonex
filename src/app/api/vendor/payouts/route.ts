import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifyOrganizer } from "@/lib/auth/verify-session";
import type { ProcessedBatch } from "@/lib/types";

// GET /api/vendor/payouts - Get experience vendor's payouts (similar to organizer payouts)
export async function GET(req: NextRequest) {
    try {
        const orgResult = await verifyOrganizer();
        if (orgResult instanceof NextResponse) {
            return orgResult;
        }

        const { organizerId } = orgResult;

        // Fetch vendor's experiences
        const experiencesSnapshot = await adminDb
            .collection("experiences")
            .where("vendor.id", "==", organizerId)
            .get();

        const experiences = experiencesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        const experienceIds = experiences.map((e: any) => e.id);

        // Fetch bookings for these experiences
        // Handle Firestore 'in' query limit of 10
        let allBookings: any[] = [];

        for (let i = 0; i < experienceIds.length; i += 10) {
            const batchIds = experienceIds.slice(i, i + 10);
            if (batchIds.length > 0) {
                const bookingsQuery = adminDb
                    .collection("experience_bookings")
                    .where("experienceId", "in", batchIds);
                const batchSnapshot = await bookingsQuery.get();
                allBookings.push(...batchSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })));
            }
        }

        const bookings = allBookings;

        // Group bookings by experience and activity date
        const bookingsByDate: Record<string, any[]> = {};
        bookings.forEach((booking: any) => {
            const activityDate = new Date(booking.activityDate)
                .toISOString()
                .split("T")[0];
            const key = `${booking.experienceId}::${activityDate}`;
            if (!bookingsByDate[key]) {
                bookingsByDate[key] = [];
            }
            bookingsByDate[key].push(booking);
        });

        if (!organizerId) {
            return NextResponse.json(
                { error: "Organizer ID not found" },
                { status: 400 }
            );
        }

        // Get commission rate from organizer (default 10%)
        const organizerDoc = await adminDb.collection("organizers").doc(organizerId).get();
        const commissionRate = organizerDoc.data()?.commissionRate || 10;

        // Process each date group as a "batch"
        const settlements: ProcessedBatch[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (const [key, batchBookings] of Object.entries(bookingsByDate)) {
            const [experienceId, activityDateStr] = key.split("::");
            const activityDate = new Date(activityDateStr);

            // Only process past dates
            if (activityDate >= today) {
                continue;
            }

            const experience = experiences.find((e: any) => e.id === experienceId);
            if (!experience) continue;

            const successfulBookings = batchBookings.filter(
                (b: any) => b.status === "Confirmed"
            );
            const cancelledBookings = batchBookings.filter(
                (b: any) => b.status === "Cancelled"
            );

            const successfulRevenue = successfulBookings.reduce(
                (sum: number, b: any) => sum + (b.totalPrice || 0),
                0
            );

            const commission = (successfulRevenue * commissionRate) / 100;
            const netEarning = successfulRevenue - commission;

            settlements.push({
                id: key,
                tripTitle: (experience as any).title || "Experience",
                batchEndDate: activityDateStr,
                grossRevenue: successfulRevenue,
                commission,
                netEarning,
                status: "Available for Payout",
                successfulBookingsCount: successfulBookings.length,
                cancelledBookingsCount: cancelledBookings.length,
                successfulRevenue,
                cancellationRevenue: 0,
                organizerId,
            });
        }

        // Sort by date (most recent first)
        settlements.sort(
            (a, b) =>
                new Date(b.batchEndDate).getTime() -
                new Date(a.batchEndDate).getTime()
        );

        return NextResponse.json({ settlements }, { status: 200 });
    } catch (error: any) {
        console.error("Get vendor payouts error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch payouts" },
            { status: 500 }
        );
    }
}

