import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifySession } from "@/lib/auth/verify-session";
import { FieldValue } from "firebase-admin/firestore";
import type { Review } from "@/lib/types";
import type FirebaseFirestore from "firebase-admin/firestore";
import { z } from "zod";

const createReviewSchema = z.object({
    tripId: z.string().optional(),
    experienceId: z.string().optional(),
    rating: z.number().min(1).max(5),
    comment: z.string().min(1, "Comment is required"),
});

// GET /api/reviews - Get reviews for a trip or experience
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const tripId = searchParams.get("tripId");
        const experienceId = searchParams.get("experienceId");

        if (!tripId && !experienceId) {
            return NextResponse.json(
                { error: "tripId or experienceId is required" },
                { status: 400 }
            );
        }

        let query: FirebaseFirestore.Query = adminDb.collection("reviews");

        if (tripId) {
            query = query.where("tripId", "==", tripId);
        } else if (experienceId) {
            query = query.where("experienceId", "==", experienceId);
        }

        const snapshot = await query.orderBy("date", "desc").get();
        const reviews = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        return NextResponse.json({ reviews }, { status: 200 });
    } catch (error: any) {
        console.error("Get reviews error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch reviews" },
            { status: 500 }
        );
    }
}

// POST /api/reviews - Create a review
export async function POST(req: NextRequest) {
    try {
        const authResult = await verifySession();
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const { user } = authResult;
        const body = await req.json();
        const result = createReviewSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error.errors[0].message },
                { status: 400 }
            );
        }

        const { tripId, experienceId, rating, comment } = result.data;

        // Get user data
        const userDoc = await adminDb.collection("users").doc(user.uid).get();
        const userData = userDoc.data();

        // Create review
        const reviewId = `rev_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        const review: Review = {
            id: reviewId,
            tripId,
            experienceId,
            author: userData?.name || "Anonymous",
            avatar: userData?.avatar || "",
            rating,
            comment,
            date: new Date().toISOString(),
        };

        const reviewRef = adminDb.collection("reviews").doc(reviewId);
        await reviewRef.set(review);

        // Update trip/experience rating
        if (tripId) {
            const tripRef = adminDb.collection("trips").doc(tripId);
            const tripDoc = await tripRef.get();
            if (tripDoc.exists) {
                const tripData = tripDoc.data();
                const reviews = tripData?.reviews || [];
                const totalRating = reviews.reduce((sum: number, r: Review) => sum + r.rating, 0) + rating;
                const reviewCount = reviews.length + 1;
                const avgRating = totalRating / reviewCount;

                await tripRef.update({
                    reviews: FieldValue.arrayUnion(review),
                    rating: avgRating,
                    reviewsCount: reviewCount,
                });
            }
        } else if (experienceId) {
            const expRef = adminDb.collection("experiences").doc(experienceId);
            const expDoc = await expRef.get();
            if (expDoc.exists) {
                const expData = expDoc.data();
                const reviews = expData?.reviews || [];
                const totalRating = reviews.reduce((sum: number, r: Review) => sum + r.rating, 0) + rating;
                const reviewCount = reviews.length + 1;
                const avgRating = totalRating / reviewCount;

                await expRef.update({
                    reviews: FieldValue.arrayUnion(review),
                    rating: avgRating,
                    reviewsCount: reviewCount,
                });
            }
        }

        return NextResponse.json({ review }, { status: 201 });
    } catch (error: any) {
        console.error("Create review error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to create review" },
            { status: 500 }
        );
    }
}

