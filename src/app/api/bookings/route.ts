import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifySession, verifyOrganizer } from "@/lib/auth/verify-session";
import { razorpay } from "@/lib/razorpay";
import { FieldValue } from "firebase-admin/firestore";
import type { Booking, Trip, Coupon } from "@/lib/types";
import type FirebaseFirestore from "firebase-admin/firestore";
import { z } from "zod";

const createBookingSchema = z.object({
    tripId: z.string().min(1),
    batchId: z.string().min(1),
    numberOfTravelers: z.number().positive(),
    paymentType: z.enum(["Full", "Partial"]),
    couponCode: z.string().optional(),
    coTravelers: z.array(z.any()).optional(),
});

// GET /api/bookings - Get user's bookings or organizer's bookings
export async function GET(req: NextRequest) {
    try {
        const authResult = await verifySession();
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const { searchParams } = new URL(req.url);
        const organizerId = searchParams.get("organizerId");
        const { user } = authResult;

        let query: FirebaseFirestore.Query = adminDb.collection("bookings");

        if (organizerId) {
            // Get organizer's bookings
            const orgResult = await verifyOrganizer();
            if (orgResult instanceof NextResponse) {
                return orgResult;
            }
            query = query.where("organizerId", "==", organizerId);
        } else {
            // Get user's bookings
            query = query.where("travelerId", "==", user.uid);
        }

        const snapshot = await query.orderBy("bookingDate", "desc").get();
        const bookings = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        return NextResponse.json({ bookings }, { status: 200 });
    } catch (error: any) {
        console.error("Get bookings error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch bookings" },
            { status: 500 }
        );
    }
}

// POST /api/bookings - Create a new booking
export async function POST(req: NextRequest) {
    try {
        const authResult = await verifySession();
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const { user } = authResult;
        const body = await req.json();
        const result = createBookingSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error.errors[0].message },
                { status: 400 }
            );
        }

        const { tripId, batchId, numberOfTravelers, paymentType, couponCode, coTravelers } =
            result.data;

        // Fetch trip to get details
        const tripRef = adminDb.collection("trips").doc(tripId);
        const tripDoc = await tripRef.get();

        if (!tripDoc.exists) {
            return NextResponse.json({ error: "Trip not found" }, { status: 404 });
        }

        const trip = { id: tripDoc.id, ...tripDoc.data() } as Trip;

        // Check batch availability
        const batches = trip.batches || [];
        const batch = batches.find((b) => b.id === batchId);

        if (!batch) {
            return NextResponse.json({ error: "Batch not found" }, { status: 404 });
        }

        if (batch.availableSlots < numberOfTravelers) {
            return NextResponse.json(
                { error: "Not enough slots available" },
                { status: 400 }
            );
        }

        // Calculate price
        let totalPrice = (batch.priceOverride || trip.price) * numberOfTravelers;
        let proDiscount = 0;
        let couponDiscount = 0;

        // Check for Pro subscription discount
        const userDoc = await adminDb.collection("users").doc(user.uid).get();
        const userData = userDoc.data();
        const isProMember =
            userData?.subscriptionTier === "pro" &&
            userData?.subscriptionHistory?.some(
                (sub: any) =>
                    sub.status === "active" &&
                    new Date(sub.endDate) > new Date()
            );

        if (isProMember) {
            proDiscount = totalPrice * 0.05; // 5% discount
            totalPrice -= proDiscount;
        }

        // Apply coupon if provided
        if (couponCode) {
            const couponQuery = await adminDb
                .collection("coupons")
                .where("code", "==", couponCode.toUpperCase())
                .where("isActive", "==", true)
                .limit(1)
                .get();

            if (!couponQuery.empty) {
                const coupon = couponQuery.docs[0].data() as Coupon;
                const now = new Date();

                // Check expiry
                if (!coupon.expiresAt || new Date(coupon.expiresAt) > now) {
                    // Check usage limit
                    if (!coupon.usageLimit || (coupon.timesUsed || 0) < coupon.usageLimit) {
                        // Check scope
                        if (
                            coupon.scope === "global" ||
                            (coupon.scope === "organizer" &&
                                coupon.organizerId === trip.organizer.id)
                        ) {
                            if (coupon.type === "percentage") {
                                couponDiscount = totalPrice * (coupon.value / 100);
                            } else {
                                couponDiscount = coupon.value;
                            }
                            totalPrice -= couponDiscount;

                            // Increment coupon usage
                            await adminDb
                                .collection("coupons")
                                .doc(couponQuery.docs[0].id)
                                .update({
                                    timesUsed: FieldValue.increment(1),
                                });
                        }
                    }
                }
            }
        }

        // Calculate amount to pay
        const spotReservationPercentage =
            trip.spotReservationEnabled && trip.spotReservationPercentage
                ? trip.spotReservationPercentage
                : 0;

        const amountToPay =
            paymentType === "Full"
                ? totalPrice
                : Math.round((totalPrice * spotReservationPercentage) / 100);

        // Create booking document
        const bookingId = `bk_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        const booking: Booking = {
            id: bookingId,
            tripId,
            batchId,
            tripTitle: trip.title,
            travelerName: userData?.name || "User",
            travelerPhone: user.phone || "",
            travelerId: user.uid,
            bookingDate: new Date().toISOString(),
            totalPrice,
            organizerId: trip.organizer.id,
            numberOfTravelers,
            paymentType,
            amountPaid: 0,
            balanceDue: totalPrice,
            paymentStatus: "Reserved",
            proDiscount,
            coTravelers,
        };

        const bookingRef = adminDb.collection("bookings").doc(bookingId);
        await bookingRef.set(booking);

        // Create Razorpay order
        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(amountToPay * 100), // Convert to paise
            currency: "INR",
            receipt: bookingId,
            notes: {
                bookingId,
                tripId,
                batchId,
                numberOfTravelers,
                type: "trip_booking",
            },
        });

        return NextResponse.json(
            {
                booking,
                order: {
                    id: razorpayOrder.id,
                    amount: razorpayOrder.amount,
                    currency: razorpayOrder.currency,
                },
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Create booking error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to create booking" },
            { status: 500 }
        );
    }
}

