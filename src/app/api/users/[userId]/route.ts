import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifySession } from "@/lib/auth/verify-session";
import { FieldValue } from "firebase-admin/firestore";
import type { User } from "@/lib/types";

// GET /api/users/[userId] - Get user profile
export async function GET(
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

    // Users can only see their own profile (or admin can see all)
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

    const userData = { id: userDoc.id, ...userDoc.data() } as User;

    return NextResponse.json({ user: userData }, { status: 200 });
  } catch (error: any) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// PUT /api/users/[userId] - Update user profile
export async function PUT(
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

    // Users can only update their own profile (or admin)
    if (user.uid !== userId && user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Access denied" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const userRef = adminDb.collection("users").doc(userId);

    // Remove id from body if present (can't update document ID)
    const { id, ...updateData } = body;

    await userRef.update({
      ...updateData,
      updatedAt: FieldValue.serverTimestamp(),
    });

    const updatedDoc = await userRef.get();
    const updatedUser = { id: updatedDoc.id, ...updatedDoc.data() } as User;

    return NextResponse.json({ user: updatedUser }, { status: 200 });
  } catch (error: any) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update user" },
      { status: 500 }
    );
  }
}

