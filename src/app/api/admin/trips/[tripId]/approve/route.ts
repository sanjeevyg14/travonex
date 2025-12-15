import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifyAdmin } from "@/lib/auth/admin-guard";
import { FieldValue } from "firebase-admin/firestore";

// POST /api/admin/trips/[tripId]/approve - Approve trip (admin only)
export async function POST(
  req: NextRequest,
  { params }: { params: { tripId: string } }
) {
  try {
    const adminResult = await verifyAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { tripId } = params;

    const tripRef = adminDb.collection("trips").doc(tripId);
    const tripDoc = await tripRef.get();

    if (!tripDoc.exists) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    await tripRef.update({
      status: "published",
      adminRemarks: FieldValue.delete(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Create audit log
    const auditLogRef = adminDb.collection("audit_logs").doc();
    await auditLogRef.set({
      timestamp: new Date().toISOString(),
      adminName: adminResult.user.email || "Admin",
      action: "Trip Approved",
      entityType: "Trip",
      entityId: tripId,
      entityName: tripDoc.data()?.title || "",
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Approve trip error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to approve trip" },
      { status: 500 }
    );
  }
}

// POST /api/admin/trips/[tripId]/reject - Reject trip (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: { tripId: string } }
) {
  try {
    const adminResult = await verifyAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { tripId } = params;
    const body = await req.json();
    const { remarks } = body;

    const tripRef = adminDb.collection("trips").doc(tripId);
    const tripDoc = await tripRef.get();

    if (!tripDoc.exists) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    await tripRef.update({
      status: "draft",
      adminRemarks: remarks || "",
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Create audit log
    const auditLogRef = adminDb.collection("audit_logs").doc();
    await auditLogRef.set({
      timestamp: new Date().toISOString(),
      adminName: adminResult.user.email || "Admin",
      action: "Trip Rejected",
      entityType: "Trip",
      entityId: tripId,
      entityName: tripDoc.data()?.title || "",
      details: remarks,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Reject trip error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to reject trip" },
      { status: 500 }
    );
  }
}

