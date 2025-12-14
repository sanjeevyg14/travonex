
import { adminAuth } from "@/lib/firebase/admin";
import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";

const loginSchema = z.object({
    idToken: z.string().min(1, "ID Token is required"),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const result = loginSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
        }

        const { idToken } = result.data;

        // Verify the token
        const decodedToken = await adminAuth.verifyIdToken(idToken);

        // Create a session cookie - 5 days
        const expiresIn = 60 * 60 * 24 * 5 * 1000;
        const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

        const options = {
            name: "session",
            value: sessionCookie,
            maxAge: expiresIn,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
        };

        cookies().set(options);

        return NextResponse.json({ status: "success" }, { status: 200 });

    } catch (error: any) {
        console.error("Login API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
