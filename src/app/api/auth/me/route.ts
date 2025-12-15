import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth/verify-session";
import { adminDb } from "@/lib/firebase/admin";
import type { User } from "@/lib/types";

// GET /api/auth/me - Get current authenticated user
export async function GET(req: NextRequest) {
    try {
        const authResult = await verifySession();
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const { user } = authResult;

        // Fetch full user document from Firestore
        const userDoc = await adminDb.collection("users").doc(user.uid).get();

        if (!userDoc.exists) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const userData = { id: userDoc.id, ...userDoc.data() } as User;

        return NextResponse.json({ user: userData }, { status: 200 });
    } catch (error: any) {
        console.error("Get current user error:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}

