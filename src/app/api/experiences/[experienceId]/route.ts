import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifyOrganizer } from "@/lib/auth/verify-session";
import { verifyAdmin } from "@/lib/auth/admin-guard";
import { FieldValue } from "firebase-admin/firestore";

// GET /api/experiences/[experienceId] - Get a single experience
export async function GET(
  req: NextRequest,
  { params }: { params: { experienceId: string } }
) {
  try {
    const { experienceId } = params;
    const experienceRef = adminDb
      .collection("experiences")
      .doc(experienceId);
    const experienceDoc = await experienceRef.get();

    if (!experienceDoc.exists) {
      return NextResponse.json(
        { error: "Experience not found" },
        { status: 404 }
      );
    }

    const experience = { id: experienceDoc.id, ...experienceDoc.data() };

    return NextResponse.json({ experience }, { status: 200 });
  } catch (error: any) {
    console.error("Get experience error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch experience" },
      { status: 500 }
    );
  }
}

// PUT /api/experiences/[experienceId] - Update an experience
export async function PUT(
  req: NextRequest,
  { params }: { params: { experienceId: string } }
) {
  try {
    const authResult = await verifyOrganizer();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { experienceId } = params;
    const body = await req.json();

    const experienceRef = adminDb
      .collection("experiences")
      .doc(experienceId);
    const experienceDoc = await experienceRef.get();

    if (!experienceDoc.exists) {
      return NextResponse.json(
        { error: "Experience not found" },
        { status: 404 }
      );
    }

    const experienceData = experienceDoc.data();

    // Check if user owns this experience or is admin
    if (
      experienceData?.vendor?.id !== authResult.organizerId &&
      authResult.user.role !== "admin"
    ) {
      return NextResponse.json(
        { error: "Forbidden: You don't own this experience" },
        { status: 403 }
      );
    }

    await experienceRef.update({
      ...body,
      updatedAt: FieldValue.serverTimestamp(),
    });

    const updatedDoc = await experienceRef.get();
    const updatedExperience = { id: updatedDoc.id, ...updatedDoc.data() };

    return NextResponse.json(
      { experience: updatedExperience },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Update experience error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update experience" },
      { status: 500 }
    );
  }
}

// DELETE /api/experiences/[experienceId] - Delete an experience
export async function DELETE(
  req: NextRequest,
  { params }: { params: { experienceId: string } }
) {
  try {
    const adminResult = await verifyAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { experienceId } = params;
    const experienceRef = adminDb
      .collection("experiences")
      .doc(experienceId);
    await experienceRef.delete();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Delete experience error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete experience" },
      { status: 500 }
    );
  }
}

