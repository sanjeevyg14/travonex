
import { adminDb } from "@/lib/firebase/admin";
import { verifyAdmin } from "@/lib/auth/admin-guard";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const authResult = await verifyAdmin();

    if (authResult instanceof NextResponse) {
        return authResult;
    }

    try {
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get("limit") || "50");
        const roleFilter = searchParams.get("role");

        let query = adminDb.collection("users").orderBy("joinDate", "desc").limit(limit);

        if (roleFilter) {
            query = adminDb.collection("users").where("role", "==", roleFilter).orderBy("joinDate", "desc").limit(limit);
        }

        const snapshot = await query.get();
        const users = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json({ users }, { status: 200 });

    } catch (error: any) {
        console.error("Admin Users API Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
