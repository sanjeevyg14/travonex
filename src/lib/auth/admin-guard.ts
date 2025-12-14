import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export type AdminUser = {
    uid: string;
    email?: string;
    role: string;
};

export async function verifyAdmin(): Promise<{ user: AdminUser } | NextResponse> {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;

    if (!sessionCookie) {
        return NextResponse.json({ error: "Unauthorized: No session found" }, { status: 401 });
    }

    try {
        const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
        const uid = decodedToken.uid;

        // Check user role in Firestore
        // We could optimize this by setting custom claims, but for now we'll fetch the doc
        // to be strictly consistent with the latest data.
        const userDoc = await adminDb.collection("users").doc(uid).get();

        if (!userDoc.exists) {
            return NextResponse.json({ error: "Unauthorized: User not found" }, { status: 401 });
        }

        const userData = userDoc.data();
        const role = userData?.role;

        if (role !== "admin") {
            return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
        }

        return {
            user: {
                uid: uid,
                email: decodedToken.email,
                role: role,
            },
        };

    } catch (error) {
        console.error("Admin verification failed:", error);
        return NextResponse.json({ error: "Unauthorized: Invalid session" }, { status: 401 });
    }
}
