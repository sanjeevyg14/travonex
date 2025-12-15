import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifySession, verifyOrganizer } from "@/lib/auth/verify-session";
import { razorpay } from "@/lib/razorpay";
import { FieldValue } from "firebase-admin/firestore";
import type { ExperienceBooking, Experience } from "@/lib/types";
import { z } from "zod";

const createExperienceBookingSchema = z.object({
  experienceId: z.string().min(1),
  activityDate: z.string().min(1),
  timeSlot: z.string().min(1),
  participants: z.number().positive(),
});

// GET /api/experiences/bookings - Get experience bookings
export async function GET(req: NextRequest) {
  try {
    const authResult = await verifySession();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { searchParams } = new URL(req.url);
    const vendorId = searchParams.get("vendorId");
    const { user } = authResult;

    let query = adminDb.collection("experience_bookings");

    if (vendorId) {
      // Get vendor's bookings
      const orgResult = await verifyOrganizer();
      if (orgResult instanceof NextResponse) {
        return orgResult;
      }
      // Need to join with experiences to filter by vendor
      // For now, we'll get all and filter in memory (not ideal but works)
      query = query.where("experienceId", ">=", "");
    } else {
      // Get user's bookings
      query = query.where("travelerId", "==", user.uid);
    }

    const snapshot = await query.orderBy("bookingDate", "desc").get();
    let bookings = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Filter by vendor if needed (better to use composite index in production)
    if (vendorId) {
      const experienceIds = (
        await adminDb
          .collection("experiences")
          .where("vendor.id", "==", vendorId)
          .get()
      ).docs.map((d) => d.id);

      bookings = bookings.filter((b: any) =>
        experienceIds.includes(b.experienceId)
      );
    }

    return NextResponse.json({ bookings }, { status: 200 });
  } catch (error: any) {
    console.error("Get experience bookings error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

// POST /api/experiences/bookings - Create experience booking
export async function POST(req: NextRequest) {
  try {
    const authResult = await verifySession();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const body = await req.json();
    const result = createExperienceBookingSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { experienceId, activityDate, timeSlot, participants } = result.data;

    // Fetch experience
    const experienceRef = adminDb.collection("experiences").doc(experienceId);
    const experienceDoc = await experienceRef.get();

    if (!experienceDoc.exists) {
      return NextResponse.json(
        { error: "Experience not found" },
        { status: 404 }
      );
    }

    const experience = {
      id: experienceDoc.id,
      ...experienceDoc.data(),
    } as Experience;

    // Validate time slot availability (simplified - you may want to implement booking slots)
    const availability = experience.availability;
    if (
      !availability.timeSlots.includes(timeSlot) ||
      (availability.type === "weekdays" &&
        new Date(activityDate).getDay() > 5) ||
      (availability.type === "weekends" &&
        new Date(activityDate).getDay() <= 5)
    ) {
      return NextResponse.json(
        { error: "Time slot not available for selected date" },
        { status: 400 }
      );
    }

    // Calculate price
    const totalPrice = experience.price * participants;

    // Get user data
    const userDoc = await adminDb.collection("users").doc(user.uid).get();
    const userData = userDoc.data();

    // Create booking
    const bookingId = `ebk_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const booking: ExperienceBooking = {
      id: bookingId,
      experienceId,
      experienceTitle: experience.title,
      travelerId: user.uid,
      travelerName: userData?.name || "User",
      travelerPhone: user.phone || "",
      bookingDate: new Date().toISOString(),
      activityDate,
      timeSlot,
      participants,
      totalPrice,
      amountPaid: 0,
      status: "Confirmed", // Will be confirmed after payment
      paymentStatus: "Pending",
    };

    const bookingRef = adminDb
      .collection("experience_bookings")
      .doc(bookingId);
    await bookingRef.set(booking);

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalPrice * 100), // Convert to paise
      currency: "INR",
      receipt: bookingId,
      notes: {
        experienceBookingId: bookingId,
        experienceId,
        type: "experience_booking",
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
    console.error("Create experience booking error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create booking" },
      { status: 500 }
    );
  }
}

