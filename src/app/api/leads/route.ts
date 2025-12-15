import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifySession, verifyOrganizer } from "@/lib/auth/verify-session";
import { verifyAdmin } from "@/lib/auth/admin-guard";
import { FieldValue } from "firebase-admin/firestore";
import type { Lead } from "@/lib/types";
import { z } from "zod";
import type FirebaseFirestore from "firebase-admin/firestore";

const createLeadSchema = z.object({
    tripId: z.string().min(1),
    message: z.string().min(1, "Message is required"),
});

// GET /api/leads - Get leads (for organizer or admin)
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const organizerId = searchParams.get("organizerId");
        const status = searchParams.get("status");

        let query: FirebaseFirestore.Query = adminDb.collection("leads");

        if (organizerId) {
            // Get organizer's leads
            const orgResult = await verifyOrganizer();
            if (orgResult instanceof NextResponse) {
                return orgResult;
            }

            if (orgResult.organizerId !== organizerId && orgResult.user.role !== "admin") {
                return NextResponse.json(
                    { error: "Forbidden: Access denied" },
                    { status: 403 }
                );
            }

            query = query.where("organizerId", "==", organizerId);
        } else {
            // Admin can see all leads
            const adminResult = await verifyAdmin();
            if (adminResult instanceof NextResponse) {
                return adminResult;
            }
        }

        if (status) {
            query = query.where("status", "==", status);
        }

        const snapshot = await query.orderBy("date", "desc").get();
        const leads = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        return NextResponse.json({ leads }, { status: 200 });
    } catch (error: any) {
        console.error("Get leads error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch leads" },
            { status: 500 }
        );
    }
}

// POST /api/leads - Create a new lead
export async function POST(req: NextRequest) {
    try {
        const authResult = await verifySession();
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const { user } = authResult;
        const body = await req.json();
        const result = createLeadSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error.errors[0].message },
                { status: 400 }
            );
        }

        const { tripId, message } = result.data;

        // Fetch trip to get details
        const tripRef = adminDb.collection("trips").doc(tripId);
        const tripDoc = await tripRef.get();

        if (!tripDoc.exists) {
            return NextResponse.json({ error: "Trip not found" }, { status: 404 });
        }

        const trip = tripDoc.data();
        const userDoc = await adminDb.collection("users").doc(user.uid).get();
        const userData = userDoc.data();

        // Create lead
        const leadId = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        const lead: Lead = {
            id: leadId,
            tripId,
            tripTitle: trip?.title || "",
            organizerId: trip?.organizer?.id || "",
            travelerId: user.uid,
            travelerName: userData?.name || "User",
            travelerPhone: user.phone || "",
            message,
            date: new Date().toISOString(),
            status: "new",
        };

        const leadRef = adminDb.collection("leads").doc(leadId);
        await leadRef.set(lead);

        return NextResponse.json({ lead }, { status: 201 });
    } catch (error: any) {
        console.error("Create lead error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to create lead" },
            { status: 500 }
        );
    }
}

// PUT /api/leads - Update lead status (unlock, convert, archive)
export async function PUT(req: NextRequest) {
    try {
        const authResult = await verifyOrganizer();
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const body = await req.json();
        const { leadId, status } = body;

        if (!leadId || !status) {
            return NextResponse.json(
                { error: "leadId and status are required" },
                { status: 400 }
            );
        }

        const leadRef = adminDb.collection("leads").doc(leadId);
        const leadDoc = await leadRef.get();

        if (!leadDoc.exists) {
            return NextResponse.json({ error: "Lead not found" }, { status: 404 });
        }

        const leadData = leadDoc.data();

        // Check ownership
        if (
            leadData?.organizerId !== authResult.organizerId &&
            authResult.user.role !== "admin"
        ) {
            return NextResponse.json(
                { error: "Forbidden: Access denied" },
                { status: 403 }
            );
        }

        await leadRef.update({
            status,
            updatedAt: FieldValue.serverTimestamp(),
        });

        const updatedDoc = await leadRef.get();
        const updatedLead = { id: updatedDoc.id, ...updatedDoc.data() };

        return NextResponse.json({ lead: updatedLead }, { status: 200 });
    } catch (error: any) {
        console.error("Update lead error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to update lead" },
            { status: 500 }
        );
    }
}

