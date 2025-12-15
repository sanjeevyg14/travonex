import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifySession, verifyOrganizer } from "@/lib/auth/verify-session";
import { verifyAdmin } from "@/lib/auth/admin-guard";
import { FieldValue } from "firebase-admin/firestore";

// GET /api/bookings/[bookingId] - Get a single booking
export async function GET(
  req: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    const authResult = await verifySession();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { bookingId } = params;
    const bookingRef = adminDb.collection("bookings").doc(bookingId);
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    const booking = { id: bookingDoc.id, ...bookingDoc.data() };

    // Check if user owns this booking or is admin/organizer
    const { user } = authResult;
    if (
      booking.travelerId !== user.uid &&
      booking.organizerId !== authResult.organizerId &&
      user.role !== "admin"
    ) {
      return NextResponse.json(
        { error: "Forbidden: Access denied" },
        { status: 403 }
      );
    }

    return NextResponse.json({ booking }, { status: 200 });
  } catch (error: any) {
    console.error("Get booking error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch booking" },
      { status: 500 }
    );
  }
}

// PUT /api/bookings/[bookingId] - Update booking (for refunds, etc.)
export async function PUT(
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

    // Only allow updates for refunds and cancellations
    // Admin and organizer can update, travelers can only request refunds
    if (
      user.role !== "admin" &&
      booking?.organizerId !== authResult.organizerId &&
      booking?.travelerId !== user.uid
    ) {
      return NextResponse.json(
        { error: "Forbidden: Access denied" },
        { status: 403 }
      );
    }

    await bookingRef.update({
      ...body,
      updatedAt: FieldValue.serverTimestamp(),
    });

    const updatedDoc = await bookingRef.get();
    const updatedBooking = { id: updatedDoc.id, ...updatedDoc.data() };

    return NextResponse.json({ booking: updatedBooking }, { status: 200 });
  } catch (error: any) {
    console.error("Update booking error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update booking" },
      { status: 500 }
    );
  }
}

