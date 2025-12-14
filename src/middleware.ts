
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const session = request.cookies.get("session");

    const isProtectedRoute =
        request.nextUrl.pathname.startsWith("/management") ||
        request.nextUrl.pathname.startsWith("/organizer") ||
        request.nextUrl.pathname.startsWith("/api/protected");

    if (isProtectedRoute && !session) {
        // Redirect to login if accessing protected route without session
        // Differentiate between generic login and organizer login based on path?
        // For now, robust default is main login.
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Add more logic here to verify session validity via verifySessionCookie 
    // if using edge-compatible verification or just check presence pattern.
    // Note: Standard Firebase verification requires Node runtime, not Edge.
    // So for middleware, we often just check presence and let the page/layout do deep verify.

    return NextResponse.next();
}

export const config = {
    matcher: ["/management/:path*", "/organizer/:path*", "/api/protected/:path*"],
};
