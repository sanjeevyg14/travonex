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
    approvedAmount: z.number().positive("Refund amount must be positive"),
    remarks: z.string().optional(),
});

const processRefundSchema = z.object({
    utr: z.string().optional(),
});

// POST /api/experiences/bookings/[bookingId]/refund - Handle experience booking refunds
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

        const bookingRef = adminDb.collection("experience_bookings").doc(bookingId);
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
            // Vendor approves refund
            const orgResult = await verifyOrganizer();
            if (orgResult instanceof NextResponse) {
                return orgResult;
            }

            // Verify vendor owns the experience
            const experienceRef = adminDb.collection("experiences").doc(booking?.experienceId);
            const experienceDoc = await experienceRef.get();
            const experience = experienceDoc.data();

            if (experience?.vendor?.id !== orgResult.organizerId) {
                return NextResponse.json(
                    { error: "Forbidden: You don't own this experience" },
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
                approvedRefundAmount: result.data.approvedAmount,
                refundRemarks: result.data.remarks || null,
                refundRejectionReason: null,
                updatedAt: FieldValue.serverTimestamp(),
            });

            return NextResponse.json({ success: true }, { status: 200 });
        } else if (action === "reject") {
            // Vendor rejects refund
            const orgResult = await verifyOrganizer();
            if (orgResult instanceof NextResponse) {
                return orgResult;
            }

            // Verify vendor owns the experience
            const experienceRef = adminDb.collection("experiences").doc(booking?.experienceId);
            const experienceDoc = await experienceRef.get();
            const experience = experienceDoc.data();

            if (experience?.vendor?.id !== orgResult.organizerId) {
                return NextResponse.json(
                    { error: "Forbidden: You don't own this experience" },
                    { status: 403 }
                );
            }

            const { reason } = body;
            if (!reason || !reason.trim()) {
                return NextResponse.json(
                    { error: "Reason is required for rejection" },
                    { status: 400 }
                );
            }

            await bookingRef.update({
                refundStatus: "rejected_by_organizer",
                refundRejectionReason: reason,
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
                    { error: "Refund must be approved by vendor first" },
                    { status: 400 }
                );
            }

            if (!booking?.paymentGatewayId) {
                return NextResponse.json(
                    { error: "Payment gateway ID not found" },
                    { status: 400 }
                );
            }

            const approvedAmount = booking.approvedRefundAmount || booking.totalPrice;

            try {
                // Create Razorpay refund
                const refund = await razorpay.payments.refund(booking.paymentGatewayId, {
                    amount: Math.round(approvedAmount * 100), // Convert to paise
                    notes: {
                        bookingId: bookingId,
                        type: "experience_booking_refund",
                        adminId: adminResult.user.uid,
                    },
                });

                await bookingRef.update({
                    refundStatus: "processed",
                    refundProcessedDate: new Date().toISOString(),
                    refundGatewayId: refund.id,
                    utr: body.utr || null,
                    updatedAt: FieldValue.serverTimestamp(),
                });

                return NextResponse.json(
                    {
                        success: true,
                        refund: {
                            id: refund.id,
                            amount: refund.amount / 100,
                            status: refund.status,
                        },
                    },
                    { status: 200 }
                );
            } catch (razorpayError: any) {
                console.error("Razorpay refund error:", razorpayError);
                return NextResponse.json(
                    {
                        error:
                            razorpayError.description ||
                            razorpayError.error?.description ||
                            "Failed to process refund",
                    },
                    { status: 500 }
                );
            }
        } else {
            return NextResponse.json(
                { error: "Invalid action. Use 'request', 'approve', 'reject', or 'process'" },
                { status: 400 }
            );
        }
    } catch (error: any) {
        console.error("Refund API error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to process refund request" },
            { status: 500 }
        );
    }
}

