import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifyOrganizer } from "@/lib/auth/verify-session";
import { razorpay } from "@/lib/razorpay";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";

const purchaseCreditsSchema = z.object({
  packageId: z.string().min(1, "Package ID is required"),
});

// POST /api/organizers/[organizerId]/credits/purchase - Purchase lead credits
export async function POST(
  req: NextRequest,
  { params }: { params: { organizerId: string } }
) {
  try {
    const orgResult = await verifyOrganizer();
    if (orgResult instanceof NextResponse) {
      return orgResult;
    }

    const { organizerId } = params;

    // Verify organizer owns this account
    if (orgResult.organizerId !== organizerId && orgResult.user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Access denied" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const result = purchaseCreditsSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { packageId } = result.data;

    // Fetch lead package
    const packageDoc = await adminDb
      .collection("lead_packages")
      .doc(packageId)
      .get();

    if (!packageDoc.exists) {
      return NextResponse.json(
        { error: "Lead package not found" },
        { status: 404 }
      );
    }

    const packageData = packageDoc.data();

    // Fetch organizer
    const organizerRef = adminDb.collection("organizers").doc(organizerId);
    const organizerDoc = await organizerRef.get();

    if (!organizerDoc.exists) {
      return NextResponse.json(
        { error: "Organizer not found" },
        { status: 404 }
      );
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: Math.round((packageData?.price || 0) * 100), // Convert to paise
      currency: "INR",
      receipt: `credits_${Date.now()}`,
      notes: {
        organizerId,
        packageId,
        credits: packageData?.credits || 0,
        type: "lead_credits_purchase",
      },
    });

    return NextResponse.json(
      {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        package: {
          id: packageId,
          credits: packageData?.credits,
          price: packageData?.price,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Purchase credits error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create purchase order" },
      { status: 500 }
    );
  }
}

