import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifyAdmin } from "@/lib/auth/admin-guard";
import { verifyOrganizer } from "@/lib/auth/verify-session";
import type { Coupon } from "@/lib/types";
import { z } from "zod";

const createCouponSchema = z.object({
  code: z.string().min(1, "Code is required"),
  type: z.enum(["percentage", "fixed"]),
  value: z.number().positive("Value must be positive"),
  description: z.string().optional(),
  scope: z.enum(["global", "organizer"]),
  organizerId: z.string().optional(),
  usageLimit: z.number().optional(),
  expiresAt: z.string().optional(),
  isActive: z.boolean().default(true),
});

// GET /api/coupons - Get coupons (admin or organizer)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const organizerId = searchParams.get("organizerId");
    const code = searchParams.get("code");

    let query = adminDb.collection("coupons");

    if (code) {
      query = query.where("code", "==", code.toUpperCase());
    } else if (organizerId) {
      query = query.where("organizerId", "==", organizerId);
    } else {
      // Admin can see all, organizer can only see their own or global
      const orgResult = await verifyOrganizer();
      if (!(orgResult instanceof NextResponse)) {
        query = query.where("organizerId", "==", orgResult.organizerId);
      }
    }

    const snapshot = await query.where("isActive", "==", true).get();
    const coupons = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ coupons }, { status: 200 });
  } catch (error: any) {
    console.error("Get coupons error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}

// POST /api/coupons - Create a coupon (admin or organizer)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = createCouponSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const couponData = result.data;

    // Check if organizer scope requires organizer auth
    if (couponData.scope === "organizer") {
      const orgResult = await verifyOrganizer();
      if (orgResult instanceof NextResponse) {
        return orgResult;
      }
      couponData.organizerId = orgResult.organizerId;
    } else {
      // Global coupons require admin
      const adminResult = await verifyAdmin();
      if (adminResult instanceof NextResponse) {
        return adminResult;
      }
    }

    // Check if code already exists
    const existingQuery = await adminDb
      .collection("coupons")
      .where("code", "==", couponData.code.toUpperCase())
      .limit(1)
      .get();

    if (!existingQuery.empty) {
      return NextResponse.json(
        { error: "Coupon code already exists" },
        { status: 400 }
      );
    }

    const coupon: Coupon = {
      ...couponData,
      code: couponData.code.toUpperCase(),
      timesUsed: 0,
    };

    const couponRef = adminDb.collection("coupons").doc();
    await couponRef.set(coupon);

    return NextResponse.json(
      { coupon: { id: couponRef.id, ...coupon } },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create coupon error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create coupon" },
      { status: 500 }
    );
  }
}

