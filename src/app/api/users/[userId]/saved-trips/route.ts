import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifySession } from "@/lib/auth/verify-session";
import { FieldValue } from "firebase-admin/firestore";

// GET /api/users/[userId]/saved-trips - Get user's saved trips
export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const authResult = await verifySession();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { userId } = params;
    const { user } = authResult;

    // Users can only see their own saved trips
    if (user.uid !== userId && user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Access denied" },
        { status: 403 }
      );
    }

    const userRef = adminDb.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data();
    const savedTripIds = userData?.savedTrips || [];

    // Fetch trip details
    const trips = [];
    for (const tripId of savedTripIds) {
      const tripRef = adminDb.collection("trips").doc(tripId);
      const tripDoc = await tripRef.get();
      if (tripDoc.exists) {
        trips.push({ id: tripDoc.id, ...tripDoc.data() });
      }
    }

    return NextResponse.json({ savedTrips: trips }, { status: 200 });
  } catch (error: any) {
    console.error("Get saved trips error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch saved trips" },
      { status: 500 }
    );
  }
}

// POST /api/users/[userId]/saved-trips - Toggle saved trip
export async function POST(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const authResult = await verifySession();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { userId } = params;
    const { user } = authResult;

    // Users can only modify their own saved trips
    if (user.uid !== userId) {
      return NextResponse.json(
        { error: "Forbidden: Access denied" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { tripId } = body;

    if (!tripId) {
      return NextResponse.json(
        { error: "tripId is required" },
        { status: 400 }
      );
    }

    // Check if trip exists
    const tripRef = adminDb.collection("trips").doc(tripId);
    const tripDoc = await tripRef.get();

    if (!tripDoc.exists) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const userRef = adminDb.collection("users").doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.data();
    const savedTrips = userData?.savedTrips || [];

    let updatedSavedTrips: string[];
    let action: "added" | "removed";

    if (savedTrips.includes(tripId)) {
      // Remove from saved
      updatedSavedTrips = savedTrips.filter((id: string) => id !== tripId);
      action = "removed";
    } else {
      // Add to saved
      updatedSavedTrips = [...savedTrips, tripId];
      action = "added";
    }

    await userRef.update({
      savedTrips: updatedSavedTrips,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json(
      { success: true, action, savedTrips: updatedSavedTrips },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Toggle saved trip error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update saved trips" },
      { status: 500 }
    );
  }
}

