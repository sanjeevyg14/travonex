import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifyAdmin } from "@/lib/auth/admin-guard";
import type { Referral } from "@/lib/types";

// GET /api/admin/referrals - Get all referrals (admin only)
export async function GET(req: NextRequest) {
  try {
    const adminResult = await verifyAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "100");

    const snapshot = await adminDb
      .collection("referrals")
      .orderBy("date", "desc")
      .limit(limit)
      .get();

    const referrals = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Referral[];

    return NextResponse.json({ referrals }, { status: 200 });
  } catch (error: any) {
    console.error("Get referrals error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch referrals" },
      { status: 500 }
    );
  }
}

