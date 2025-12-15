import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase/admin";
import { verifySession } from "@/lib/auth/verify-session";
import { FieldValue } from "firebase-admin/firestore";

// POST /api/users/[userId]/deactivate - Deactivate user account
export async function POST(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const authResult = await verifySession();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { userId } = params;
    const { user } = authResult;

    // Users can only deactivate their own account (or admin can deactivate any)
    if (user.uid !== userId && user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Access denied" },
        { status: 403 }
      );
    }

    const userRef = adminDb.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Deactivate user account
    await userRef.update({
      status: "inactive",
      deactivatedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Revoke all sessions for this user (optional - more secure)
    // This requires getting all refresh tokens, which Firebase Admin SDK doesn't directly support
    // Instead, we rely on session cookie expiration

    return NextResponse.json(
      { message: "Account deactivated successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Deactivate user error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to deactivate account" },
      { status: 500 }
    );
  }
}

