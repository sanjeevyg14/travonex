import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export type AuthUser = {
  uid: string;
  phone?: string;
  email?: string;
  role: string;
  organizerId?: string;
  subscriptionTier?: string;
};

/**
 * Verify user session and return user info
 * Returns either the user object or a NextResponse error
 */
export async function verifySession(): Promise<
  { user: AuthUser } | NextResponse
> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) {
    return NextResponse.json(
      { error: "Unauthorized: No session found" },
      { status: 401 }
    );
  }

  try {
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
    const uid = decodedToken.uid;

    // Fetch user from Firestore to get role and other data
    const userDoc = await adminDb.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: "Unauthorized: User not found" },
        { status: 401 }
      );
    }

    const userData = userDoc.data();
    const role = userData?.role || "traveler";

    return {
      user: {
        uid: uid,
        phone: decodedToken.phone_number || userData?.phone,
        email: decodedToken.email,
        role: role,
        organizerId: userData?.organizerId,
        subscriptionTier: userData?.subscriptionTier,
      },
    };
  } catch (error) {
    console.error("Session verification failed:", error);
    return NextResponse.json(
      { error: "Unauthorized: Invalid session" },
      { status: 401 }
    );
  }
}

/**
 * Verify user is an organizer (has organizer role or organizerId)
 */
export async function verifyOrganizer(): Promise<
  { user: AuthUser; organizerId?: string } | NextResponse
> {
  const result = await verifySession();
  if (result instanceof NextResponse) {
    return result;
  }

  const { user } = result;
  const userDoc = await adminDb.collection("users").doc(user.uid).get();
  const userData = userDoc.data();

  const organizerId = userData?.organizerId;

  if (user.role === "admin" || organizerId) {
    return { user, organizerId };
  }

  return NextResponse.json(
    { error: "Forbidden: Organizer access required" },
    { status: 403 }
  );
}

