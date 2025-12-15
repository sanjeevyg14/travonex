import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifySession, verifyOrganizer } from "@/lib/auth/verify-session";
import { verifyAdmin } from "@/lib/auth/admin-guard";
import { FieldValue } from "firebase-admin/firestore";
import type { Trip } from "@/lib/types";

// GET /api/trips/[tripId] - Get a single trip
export async function GET(
    req: NextRequest,
    { params }: { params: { tripId: string } }
) {
    try {
        const { tripId } = params;
        const tripRef = adminDb.collection("trips").doc(tripId);
        const tripDoc = await tripRef.get();

        if (!tripDoc.exists) {
            return NextResponse.json({ error: "Trip not found" }, { status: 404 });
        }

        const trip = { id: tripDoc.id, ...tripDoc.data() };

        return NextResponse.json({ trip }, { status: 200 });
    } catch (error: any) {
        console.error("Get trip error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch trip" },
            { status: 500 }
        );
    }
}

// PUT /api/trips/[tripId] - Update a trip
export async function PUT(
    req: NextRequest,
    { params }: { params: { tripId: string } }
) {
    try {
        const authResult = await verifyOrganizer();
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const { tripId } = params;
        const body = await req.json();

        const tripRef = adminDb.collection("trips").doc(tripId);
        const tripDoc = await tripRef.get();

        if (!tripDoc.exists) {
            return NextResponse.json({ error: "Trip not found" }, { status: 404 });
        }

        const tripData = tripDoc.data();

        // Check if user owns this trip or is admin
        if (
            tripData?.organizer?.id !== authResult.organizerId &&
            authResult.user.role !== "admin"
        ) {
            return NextResponse.json(
                { error: "Forbidden: You don't own this trip" },
                { status: 403 }
            );
        }

        // Update trip
        await tripRef.update({
            ...body,
            updatedAt: FieldValue.serverTimestamp(),
        });

        const updatedDoc = await tripRef.get();
        const updatedTrip = { id: updatedDoc.id, ...updatedDoc.data() };

        return NextResponse.json({ trip: updatedTrip }, { status: 200 });
    } catch (error: any) {
        console.error("Update trip error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to update trip" },
            { status: 500 }
        );
    }
}

// DELETE /api/trips/[tripId] - Delete a trip
export async function DELETE(
    req: NextRequest,
    { params }: { params: { tripId: string } }
) {
    try {
        const adminResult = await verifyAdmin();
        if (adminResult instanceof NextResponse) {
            return adminResult;
        }

        const { tripId } = params;
        const tripRef = adminDb.collection("trips").doc(tripId);
        await tripRef.delete();

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
        console.error("Delete trip error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to delete trip" },
            { status: 500 }
        );
    }
}

