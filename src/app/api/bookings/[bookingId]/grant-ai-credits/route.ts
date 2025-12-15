import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifySession } from "@/lib/auth/verify-session";
import { FieldValue } from "firebase-admin/firestore";

// POST /api/bookings/[bookingId]/grant-ai-credits - Grant AI credits after booking (one-time)
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
    const { user } = authResult;

    // Fetch booking
    const bookingRef = adminDb.collection("bookings").doc(bookingId);
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    const booking = bookingDoc.data();

    // Verify user owns this booking
    if (booking?.travelerId !== user.uid) {
      return NextResponse.json(
        { error: "Forbidden: You don't own this booking" },
        { status: 403 }
      );
    }

    // Check if credits already granted
    if (booking?.aiCreditsGranted) {
      return NextResponse.json(
        { error: "AI credits already granted for this booking" },
        { status: 400 }
      );
    }

    // Grant 10 AI credits to user
    const userRef = adminDb.collection("users").doc(user.uid);
    await userRef.update({
      aiCredits: FieldValue.increment(10),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Mark booking as credits granted
    await bookingRef.update({
      aiCreditsGranted: true,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Get updated user to return
    const updatedUserDoc = await userRef.get();
    const updatedUser = {
      id: updatedUserDoc.id,
      ...updatedUserDoc.data(),
    };

    return NextResponse.json(
      {
        success: true,
        aiCreditsGranted: 10,
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Grant AI credits error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to grant AI credits" },
      { status: 500 }
    );
  }
}

