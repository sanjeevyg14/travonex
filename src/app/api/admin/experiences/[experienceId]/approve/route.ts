import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifyAdmin } from "@/lib/auth/admin-guard";
import { FieldValue } from "firebase-admin/firestore";

// POST /api/admin/experiences/[experienceId]/approve - Approve experience (admin only)
export async function POST(
  req: NextRequest,
  { params }: { params: { experienceId: string } }
) {
  try {
    const adminResult = await verifyAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { experienceId } = params;

    const expRef = adminDb.collection("experiences").doc(experienceId);
    const expDoc = await expRef.get();

    if (!expDoc.exists) {
      return NextResponse.json(
        { error: "Experience not found" },
        { status: 404 }
      );
    }

    await expRef.update({
      status: "published",
      adminRemarks: FieldValue.delete(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Create audit log
    const auditLogRef = adminDb.collection("audit_logs").doc();
    await auditLogRef.set({
      timestamp: new Date().toISOString(),
      adminName: adminResult.user.email || "Admin",
      action: "Experience Approved",
      entityType: "Experience",
      entityId: experienceId,
      entityName: expDoc.data()?.title || "",
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Approve experience error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to approve experience" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/experiences/[experienceId]/reject - Reject experience (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: { experienceId: string } }
) {
  try {
    const adminResult = await verifyAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { experienceId } = params;
    const body = await req.json();
    const { remarks } = body;

    const expRef = adminDb.collection("experiences").doc(experienceId);
    const expDoc = await expRef.get();

    if (!expDoc.exists) {
      return NextResponse.json(
        { error: "Experience not found" },
        { status: 404 }
      );
    }

    await expRef.update({
      status: "draft",
      adminRemarks: remarks || "",
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Create audit log
    const auditLogRef = adminDb.collection("audit_logs").doc();
    await auditLogRef.set({
      timestamp: new Date().toISOString(),
      adminName: adminResult.user.email || "Admin",
      action: "Experience Rejected",
      entityType: "Experience",
      entityId: experienceId,
      entityName: expDoc.data()?.title || "",
      details: remarks,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Reject experience error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to reject experience" },
      { status: 500 }
    );
  }
}

