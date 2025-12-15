import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifyAdmin } from "@/lib/auth/admin-guard";
import type { Organizer } from "@/lib/types";

// GET /api/organizers - Get all organizers
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let query = adminDb.collection("organizers");

    if (status) {
      query = query.where("status", "==", status);
    }

    const snapshot = await query.get();
    const organizers = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ organizers }, { status: 200 });
  } catch (error: any) {
    console.error("Get organizers error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch organizers" },
      { status: 500 }
    );
  }
}

