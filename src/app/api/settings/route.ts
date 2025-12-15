import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifyAdmin } from "@/lib/auth/admin-guard";
import { FieldValue } from "firebase-admin/firestore";

// GET /api/settings - Get platform settings
export async function GET(req: NextRequest) {
  try {
    const settingsRef = adminDb.collection("settings").doc("platform");
    const settingsDoc = await settingsRef.get();

    if (!settingsDoc.exists) {
      // Return defaults
      return NextResponse.json(
        {
          settings: {
            commissionRate: 10,
            proSubscriptionEnabled: true,
            proPriceMonthly: 599,
            proPriceAnnual: 499,
            referralBonusAmount: 100, // Bonus for each user (referrer and referee)
            travelCities: [],
            travelInterests: [],
            tripCategories: [],
            tripDifficulties: [],
          },
        },
        { status: 200 }
      );
    }

    const settings = settingsDoc.data();
    return NextResponse.json({ settings }, { status: 200 });
  } catch (error: any) {
    console.error("Get settings error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PUT /api/settings - Update platform settings (admin only)
export async function PUT(req: NextRequest) {
  try {
    const adminResult = await verifyAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const body = await req.json();
    const settingsRef = adminDb.collection("settings").doc("platform");

    await settingsRef.set(
      {
        ...body,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    const updatedDoc = await settingsRef.get();
    const updatedSettings = updatedDoc.data();

    return NextResponse.json({ settings: updatedSettings }, { status: 200 });
  } catch (error: any) {
    console.error("Update settings error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update settings" },
      { status: 500 }
    );
  }
}

