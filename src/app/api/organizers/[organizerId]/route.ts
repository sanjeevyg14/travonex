import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifyAdmin } from "@/lib/auth/admin-guard";
import { verifyOrganizer } from "@/lib/auth/verify-session";
import { FieldValue } from "firebase-admin/firestore";
import type { Organizer } from "@/lib/types";

// GET /api/organizers/[organizerId] - Get a single organizer
export async function GET(
  req: NextRequest,
  { params }: { params: { organizerId: string } }
) {
  try {
    const { organizerId } = params;
    const organizerRef = adminDb.collection("organizers").doc(organizerId);
    const organizerDoc = await organizerRef.get();

    if (!organizerDoc.exists) {
      return NextResponse.json(
        { error: "Organizer not found" },
        { status: 404 }
      );
    }

    const organizer = { id: organizerDoc.id, ...organizerDoc.data() };

    return NextResponse.json({ organizer }, { status: 200 });
  } catch (error: any) {
    console.error("Get organizer error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch organizer" },
      { status: 500 }
    );
  }
}

// PUT /api/organizers/[organizerId] - Update organizer (admin only for status, organizer for profile)
export async function PUT(
  req: NextRequest,
  { params }: { params: { organizerId: string } }
) {
  try {
    const { organizerId } = params;
    const body = await req.json();

    // Check if updating status (admin only)
    if (body.status || body.adminRemarks || body.commissionRate) {
      const adminResult = await verifyAdmin();
      if (adminResult instanceof NextResponse) {
        return adminResult;
      }
    } else {
      // Otherwise verify organizer owns this
      const orgResult = await verifyOrganizer();
      if (orgResult instanceof NextResponse) {
        return orgResult;
      }

      if (orgResult.organizerId !== organizerId && orgResult.user.role !== "admin") {
        return NextResponse.json(
          { error: "Forbidden: Access denied" },
          { status: 403 }
        );
      }
    }

    const organizerRef = adminDb.collection("organizers").doc(organizerId);
    const organizerDoc = await organizerRef.get();

    if (!organizerDoc.exists) {
      return NextResponse.json(
        { error: "Organizer not found" },
        { status: 404 }
      );
    }

    await organizerRef.update({
      ...body,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // If status changed, update user document
    if (body.status) {
      const userQuery = await adminDb
        .collection("users")
        .where("organizerId", "==", organizerId)
        .limit(1)
        .get();

      if (!userQuery.empty) {
        await userQuery.docs[0].ref.update({
          organizerStatus: body.status,
        });
      }
    }

    const updatedDoc = await organizerRef.get();
    const updatedOrganizer = { id: updatedDoc.id, ...updatedDoc.data() };

    return NextResponse.json({ organizer: updatedOrganizer }, { status: 200 });
  } catch (error: any) {
    console.error("Update organizer error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update organizer" },
      { status: 500 }
    );
  }
}

