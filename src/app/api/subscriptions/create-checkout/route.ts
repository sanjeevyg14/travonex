import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifySession } from "@/lib/auth/verify-session";
import { razorpay } from "@/lib/razorpay";
import { z } from "zod";

const createCheckoutSchema = z.object({
  planId: z.enum(["pro-monthly", "pro-annual"]),
});

// POST /api/subscriptions/create-checkout - Create Pro subscription checkout
export async function POST(req: NextRequest) {
  try {
    const authResult = await verifySession();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const body = await req.json();
    const result = createCheckoutSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { planId } = result.data;

    // Pricing (in rupees)
    const prices = {
      "pro-monthly": 599,
      "pro-annual": 499,
    };

    const price = prices[planId];
    const planName = planId === "pro-monthly" ? "Travonex Pro - Monthly" : "Travonex Pro - Annual";

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: Math.round(price * 100), // Convert to paise
      currency: "INR",
      receipt: `pro_sub_${Date.now()}`,
      notes: {
        userId: user.uid,
        planId,
        planName,
        type: "pro_subscription",
      },
    });

    return NextResponse.json(
      {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        planId,
        planName,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Create subscription checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout" },
      { status: 500 }
    );
  }
}

