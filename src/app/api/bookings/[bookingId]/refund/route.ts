import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifySession, verifyOrganizer } from "@/lib/auth/verify-session";
import { verifyAdmin } from "@/lib/auth/admin-guard";
import { razorpay } from "@/lib/razorpay";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";

const requestRefundSchema = z.object({
    reason: z.string().min(1, "Reason is required"),
});

const approveRefundSchema = z.object({
    refundAmount: z.number().positive("Refund amount must be positive"),
    remarks: z.string().optional(),
});

const processRefundSchema = z.object({
    utr: z.string().optional(),
});

// POST /api/bookings/[bookingId]/refund/request - Request a refund
export async function POST(
    req: NextRequest,
    { params }: { params: { bookingId: string } }
) {
    try {
        const authResult = await verifySession();
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const { bookingId } = params;
        const body = await req.json();
        const { searchParams } = new URL(req.url);
        const action = searchParams.get("action") || "request";

        const bookingRef = adminDb.collection("bookings").doc(bookingId);
        const bookingDoc = await bookingRef.get();

        if (!bookingDoc.exists) {
            return NextResponse.json(
                { error: "Booking not found" },
                { status: 404 }
            );
        }

        const booking = bookingDoc.data();
        const { user } = authResult;

        if (action === "request") {
            // Traveler requests refund
            if (booking?.travelerId !== user.uid) {
                return NextResponse.json(
                    { error: "Forbidden: You don't own this booking" },
                    { status: 403 }
                );
            }

            const result = requestRefundSchema.safeParse(body);
            if (!result.success) {
                return NextResponse.json(
                    { error: result.error.errors[0].message },
                    { status: 400 }
                );
            }

            await bookingRef.update({
                refundStatus: "requested",
                refundRequestDate: new Date().toISOString(),
                cancellationReason: result.data.reason,
                cancellationInitiator: "traveler",
                updatedAt: FieldValue.serverTimestamp(),
            });

            return NextResponse.json({ success: true }, { status: 200 });
        } else if (action === "approve") {
            // Organizer approves refund
            const orgResult = await verifyOrganizer();
            if (orgResult instanceof NextResponse) {
                return orgResult;
            }

            if (booking?.organizerId !== orgResult.organizerId) {
                return NextResponse.json(
                    { error: "Forbidden: You don't own this trip" },
                    { status: 403 }
                );
            }

            const result = approveRefundSchema.safeParse(body);
            if (!result.success) {
                return NextResponse.json(
                    { error: result.error.errors[0].message },
                    { status: 400 }
                );
            }

            await bookingRef.update({
                refundStatus: "approved_by_organizer",
                approvedRefundAmount: result.data.refundAmount,
                refundRejectionReason: null,
                updatedAt: FieldValue.serverTimestamp(),
            });

            return NextResponse.json({ success: true }, { status: 200 });
        } else if (action === "reject") {
            // Organizer rejects refund
            const orgResult = await verifyOrganizer();
            if (orgResult instanceof NextResponse) {
                return orgResult;
            }

            if (booking?.organizerId !== orgResult.organizerId) {
                return NextResponse.json(
                    { error: "Forbidden: You don't own this trip" },
                    { status: 403 }
                );
            }

            const { remarks } = body;
            if (!remarks) {
                return NextResponse.json(
                    { error: "Remarks are required for rejection" },
                    { status: 400 }
                );
            }

            await bookingRef.update({
                refundStatus: "rejected_by_organizer",
                refundRejectionReason: remarks,
                updatedAt: FieldValue.serverTimestamp(),
            });

            return NextResponse.json({ success: true }, { status: 200 });
        } else if (action === "process") {
            // Admin processes refund via Razorpay
            const adminResult = await verifyAdmin();
            if (adminResult instanceof NextResponse) {
                return adminResult;
            }

            if (booking?.refundStatus !== "approved_by_organizer") {
                return NextResponse.json(
                    { error: "Refund must be approved by organizer first" },
                    { status: 400 }
                );
            }

            if (!booking?.paymentGatewayId) {
                return NextResponse.json(
                    { error: "Payment gateway ID not found" },
                    { status: 400 }
                );
            }

            const refundAmount = Math.round(
                (booking.approvedRefundAmount || booking.amountPaid) * 100
            ); // Convert to paise

            // Create refund via Razorpay
            const refund = await razorpay.payments.refund(booking.paymentGatewayId, {
                amount: refundAmount,
                notes: {
                    bookingId,
                    reason: booking.cancellationReason || "Customer request",
                },
            });

            const result = processRefundSchema.safeParse(body);

            await bookingRef.update({
                refundStatus: "processed",
                refundProcessedDate: new Date().toISOString(),
                refundUtr: result.data?.utr || refund.id,
                paymentStatus: "Cancelled",
                updatedAt: FieldValue.serverTimestamp(),
            });

            // Update trip batch slots
            if (booking.tripId && booking.batchId) {
                const tripRef = adminDb.collection("trips").doc(booking.tripId);
                const tripDoc = await tripRef.get();
                if (tripDoc.exists) {
                    const tripData = tripDoc.data();
                    const batches = tripData?.batches || [];
                    const batchIndex = batches.findIndex(
                        (b: any) => b.id === booking.batchId
                    );

                    if (batchIndex !== -1) {
                        batches[batchIndex].availableSlots += booking.numberOfTravelers;
                        if (batches[batchIndex].status === "Full") {
                            batches[batchIndex].status = "Active";
                        }
                        await tripRef.update({ batches });
                    }
                }
            }

            return NextResponse.json(
                { success: true, refundId: refund.id },
                { status: 200 }
            );
        }

        return NextResponse.json(
            { error: "Invalid action" },
            { status: 400 }
        );
    } catch (error: any) {
        console.error("Refund error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to process refund" },
            { status: 500 }
        );
    }
}

