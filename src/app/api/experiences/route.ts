import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifySession, verifyOrganizer } from "@/lib/auth/verify-session";
import type { Experience } from "@/lib/types";

// GET /api/experiences - Get all published experiences (or vendor's experiences)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const vendorId = searchParams.get("vendorId");
    const status = searchParams.get("status") || "published";
    const limit = parseInt(searchParams.get("limit") || "20");

    let query = adminDb.collection("experiences");

    // Filter by vendor if provided
    if (vendorId) {
      query = query.where("vendor.id", "==", vendorId);
    } else if (status) {
      // Only show published experiences to public
      query = query.where("status", "==", status);
    }

    const snapshot = await query.limit(limit).get();
    const experiences = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ experiences }, { status: 200 });
  } catch (error: any) {
    console.error("Get experiences error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch experiences" },
      { status: 500 }
    );
  }
}

// POST /api/experiences - Create a new experience
export async function POST(req: NextRequest) {
  try {
    const authResult = await verifyOrganizer();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user, organizerId } = authResult;
    const body = await req.json();

    // Validate experience data
    const experience: Experience = {
      ...body,
      id: body.id || `exp_${Date.now()}`,
      vendor: {
        ...body.vendor,
        id: organizerId || body.vendor?.id,
      },
      status: body.status || "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const experienceRef = adminDb.collection("experiences").doc(experience.id);
    await experienceRef.set(experience);

    return NextResponse.json({ experience }, { status: 201 });
  } catch (error: any) {
    console.error("Create experience error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create experience" },
      { status: 500 }
    );
  }
}

