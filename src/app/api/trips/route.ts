import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifySession, verifyOrganizer } from "@/lib/auth/verify-session";
import { verifyAdmin } from "@/lib/auth/admin-guard";
import type { Trip } from "@/lib/types";
import { z } from "zod";

// GET /api/trips - Get all published trips (or organizer's trips)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const organizerId = searchParams.get("organizerId");
    const status = searchParams.get("status") || "published";
    const limit = parseInt(searchParams.get("limit") || "20");

    let query = adminDb.collection("trips");

    // Filter by organizer if provided
    if (organizerId) {
      query = query.where("organizer.id", "==", organizerId);
    } else if (status) {
      // Only show published trips to public
      query = query.where("status", "==", status);
    }

    const snapshot = await query.limit(limit).get();
    const trips = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ trips }, { status: 200 });
  } catch (error: any) {
    console.error("Get trips error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch trips" },
      { status: 500 }
    );
  }
}

// POST /api/trips - Create a new trip
export async function POST(req: NextRequest) {
  try {
    const authResult = await verifyOrganizer();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user, organizerId } = authResult;
    const body = await req.json();

    // Validate trip data (simplified - you may want to add more validation)
    const trip: Trip = {
      ...body,
      id: body.id || `trip_${Date.now()}`,
      organizer: {
        ...body.organizer,
        id: organizerId || body.organizer?.id,
      },
      status: body.status || "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const tripRef = adminDb.collection("trips").doc(trip.id);
    await tripRef.set(trip);

    return NextResponse.json({ trip }, { status: 201 });
  } catch (error: any) {
    console.error("Create trip error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create trip" },
      { status: 500 }
    );
  }
}

