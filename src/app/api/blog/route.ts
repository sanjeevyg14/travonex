import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifySession } from "@/lib/auth/verify-session";
import { verifyAdmin } from "@/lib/auth/admin-guard";
import { FieldValue } from "firebase-admin/firestore";
import type { BlogStory } from "@/lib/types";
import { z } from "zod";
import type FirebaseFirestore from "firebase-admin/firestore";

const createBlogStorySchema = z.object({
  title: z.string().min(1, "Title is required"),
  excerpt: z.string().min(1, "Excerpt is required"),
  content: z.string().min(1, "Content is required"),
  image: z.string().optional(),
  status: z.enum(["published", "draft", "pending"]).default("pending"),
});

// GET /api/blog - Get blog stories
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const authorId = searchParams.get("authorId");
    const limit = parseInt(searchParams.get("limit") || "20");

    let query: FirebaseFirestore.Query = adminDb.collection("blog_stories");

    if (status) {
      query = query.where("status", "==", status);
    }

    if (authorId) {
      query = query.where("authorId", "==", authorId);
    }

    const snapshot = await query.orderBy("date", "desc").limit(limit).get();
    const stories = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ stories }, { status: 200 });
  } catch (error: any) {
    console.error("Get blog stories error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch stories" },
      { status: 500 }
    );
  }
}

// POST /api/blog - Create a blog story
export async function POST(req: NextRequest) {
  try {
    const authResult = await verifySession();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const body = await req.json();
    const result = createBlogStorySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { title, excerpt, content, image, status } = result.data;
    const userDoc = await adminDb.collection("users").doc(user.uid).get();
    const userData = userDoc.data();

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const storyId = `story_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const story: BlogStory = {
      id: storyId,
      slug,
      title,
      author: userData?.name || "Anonymous",
      authorId: user.uid,
      date: new Date().toISOString(),
      excerpt,
      content,
      image: image || "",
      status: status || "pending",
    };

    const storyRef = adminDb.collection("blog_stories").doc(storyId);
    await storyRef.set(story);

    return NextResponse.json({ story }, { status: 201 });
  } catch (error: any) {
    console.error("Create blog story error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create story" },
      { status: 500 }
    );
  }
}

// PUT /api/blog - Update blog story status (admin)
export async function PUT(req: NextRequest) {
  try {
    const adminResult = await verifyAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const body = await req.json();
    const { storyId, status } = body;

    if (!storyId || !status) {
      return NextResponse.json(
        { error: "storyId and status are required" },
        { status: 400 }
      );
    }

    const storyRef = adminDb.collection("blog_stories").doc(storyId);
    const storyDoc = await storyRef.get();

    if (!storyDoc.exists) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    await storyRef.update({
      status,
      updatedAt: FieldValue.serverTimestamp(),
    });

    const updatedDoc = await storyRef.get();
    const updatedStory = { id: updatedDoc.id, ...updatedDoc.data() };

    return NextResponse.json({ story: updatedStory }, { status: 200 });
  } catch (error: any) {
    console.error("Update blog story error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update story" },
      { status: 500 }
    );
  }
}

