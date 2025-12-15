import { NextRequest, NextResponse } from "next/server";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";

    // Verify webhook signature
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "";
    const crypto = require("crypto");
    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (generatedSignature !== signature) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);
    const { event: eventType, payload } = event;

    console.log("Razorpay webhook event:", eventType, payload.payment?.entity?.id);

    // Handle payment success
    if (eventType === "payment.captured" || eventType === "payment.authorized") {
      const payment = payload.payment.entity;
      const orderId = payment.order_id;
      const paymentId = payment.id;
      const amount = payment.amount / 100; // Convert from paise to rupees
      const notes = payment.notes || {};

      // Update booking with payment information
      if (notes.bookingId) {
        const bookingRef = adminDb.collection("bookings").doc(notes.bookingId);
        await bookingRef.update({
          paymentGatewayId: paymentId,
          paymentStatus: "Paid in Full",
          amountPaid: amount,
          balanceDue: FieldValue.increment(-amount),
          updatedAt: FieldValue.serverTimestamp(),
        });

        // Update trip batch available slots if this is a new booking
        if (notes.tripId && notes.batchId) {
          const tripRef = adminDb.collection("trips").doc(notes.tripId);
          const tripDoc = await tripRef.get();
          if (tripDoc.exists) {
            const tripData = tripDoc.data();
            const batches = tripData?.batches || [];
            const batchIndex = batches.findIndex(
              (b: any) => b.id === notes.batchId
            );

            if (batchIndex !== -1 && notes.numberOfTravelers) {
              batches[batchIndex].availableSlots -= notes.numberOfTravelers;
              if (batches[batchIndex].availableSlots <= 0) {
                batches[batchIndex].status = "Full";
              }
              await tripRef.update({ batches });
            }
          }
        }

        // Handle lead conversion if applicable
        if (notes.leadId) {
          const leadRef = adminDb.collection("leads").doc(notes.leadId);
          await leadRef.update({
            status: "converted",
            convertedAt: FieldValue.serverTimestamp(),
          });
        }
      }

      // Handle experience booking
      if (notes.experienceBookingId) {
        const expBookingRef = adminDb
          .collection("experience_bookings")
          .doc(notes.experienceBookingId);
        await expBookingRef.update({
          paymentGatewayId: paymentId,
          status: "Confirmed",
          amountPaid: amount,
          updatedAt: FieldValue.serverTimestamp(),
        });
      }

      // Handle Pro subscription
      if (notes.type === "pro_subscription" && notes.userId && notes.planId) {
        const userRef = adminDb.collection("users").doc(notes.userId);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
          const userData = userDoc.data();
          const subscriptionHistory = userData?.subscriptionHistory || [];

          // Calculate end date
          const startDate = new Date();
          const endDate = new Date();
          if (notes.planId === "pro-monthly") {
            endDate.setMonth(endDate.getMonth() + 1);
          } else {
            endDate.setFullYear(endDate.getFullYear() + 1);
          }

          const newSubscription = {
            id: `sub_${Date.now()}`,
            planId: notes.planId,
            planName: notes.planName || "Travonex Pro",
            status: "active",
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            pricePaid: amount,
            paymentGatewayId: paymentId,
          };

          await userRef.update({
            subscriptionTier: "pro",
            subscriptionHistory: FieldValue.arrayUnion(newSubscription),
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
      }

      // Handle lead credits purchase
      if (notes.type === "lead_credits_purchase" && notes.organizerId && notes.credits) {
        const organizerRef = adminDb.collection("organizers").doc(notes.organizerId);
        const organizerDoc = await organizerRef.get();

        if (organizerDoc.exists) {
          const currentCredits = organizerDoc.data()?.leadCredits || 0;
          await organizerRef.update({
            leadCredits: FieldValue.increment(parseInt(notes.credits)),
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
      }
    }

    // Handle payment failure
    if (eventType === "payment.failed") {
      const payment = payload.payment.entity;
      const notes = payment.notes || {};

      if (notes.bookingId) {
        const bookingRef = adminDb.collection("bookings").doc(notes.bookingId);
        await bookingRef.update({
          paymentStatus: "Cancelled",
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: error.message || "Webhook processing failed" },
      { status: 500 }
    );
  }
}

