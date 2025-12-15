import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifyAdmin } from "@/lib/auth/admin-guard";
import type FirebaseFirestore from "firebase-admin/firestore";
import type { AuditLog } from "@/lib/types";

// GET /api/admin/audit-logs - Get audit logs (admin only)
export async function GET(req: NextRequest) {
  try {
    const adminResult = await verifyAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const entityType = searchParams.get("entityType");
    const limit = parseInt(searchParams.get("limit") || "100");

    let query: FirebaseFirestore.Query = adminDb
      .collection("audit_logs")
      .orderBy("timestamp", "desc")
      .limit(limit);

    if (action) {
      query = query.where("action", "==", action);
    }

    if (entityType) {
      query = query.where("entityType", "==", entityType);
    }

    const snapshot = await query.get();
    const logs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ logs }, { status: 200 });
  } catch (error: any) {
    console.error("Get audit logs error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}

// POST /api/admin/audit-logs - Create audit log (internal use)
export async function POST(req: NextRequest) {
  try {
    const adminResult = await verifyAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const body = await req.json();
    const { adminName, action, entityType, entityId, entityName, details } = body;

    if (!adminName || !action || !entityType || !entityId || !entityName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const log: Omit<AuditLog, "id"> = {
      timestamp: new Date().toISOString(),
      adminName,
      action,
      entityType,
      entityId,
      entityName,
      details,
    };

    const logRef = adminDb.collection("audit_logs").doc();
    await logRef.set(log);

    return NextResponse.json(
      { log: { id: logRef.id, ...log } },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create audit log error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create audit log" },
      { status: 500 }
    );
  }
}

