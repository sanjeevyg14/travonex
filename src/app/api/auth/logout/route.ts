import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// POST /api/auth/logout - Clear session cookie
export async function POST(req: NextRequest) {
    try {
        // Clear the session cookie
        const cookieStore = await cookies();
        cookieStore.set({
            name: "session",
            value: "",
            maxAge: 0,
            path: "/",
        });

        return NextResponse.json({ status: "success", message: "Logged out successfully" }, { status: 200 });
    } catch (error: any) {
        console.error("Logout API Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}

