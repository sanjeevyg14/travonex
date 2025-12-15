import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifyAdmin } from "@/lib/auth/admin-guard";
import { FieldValue } from "firebase-admin/firestore";
import type { FAQ } from "@/lib/types";
import { z } from "zod";

const createFaqSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
});

// GET /api/faqs - Get all FAQs (public)
export async function GET(req: NextRequest) {
  try {
    const snapshot = await adminDb
      .collection("faqs")
      .orderBy("createdAt", "desc")
      .get();

    const faqs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ faqs }, { status: 200 });
  } catch (error: any) {
    console.error("Get FAQs error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch FAQs" },
      { status: 500 }
    );
  }
}

// POST /api/faqs - Create FAQ (admin only)
export async function POST(req: NextRequest) {
  try {
    const adminResult = await verifyAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const body = await req.json();
    const result = createFaqSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { question, answer } = result.data;

    const faq: FAQ = {
      question,
      answer,
    };

    const faqRef = adminDb.collection("faqs").doc();
    await faqRef.set({
      ...faq,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json(
      { faq: { id: faqRef.id, ...faq } },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create FAQ error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create FAQ" },
      { status: 500 }
    );
  }
}

// PUT /api/faqs - Update FAQ (admin only)
export async function PUT(req: NextRequest) {
  try {
    const adminResult = await verifyAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const body = await req.json();
    const { faqId, question, answer } = body;

    if (!faqId || !question || !answer) {
      return NextResponse.json(
        { error: "faqId, question, and answer are required" },
        { status: 400 }
      );
    }

    const faqRef = adminDb.collection("faqs").doc(faqId);
    const faqDoc = await faqRef.get();

    if (!faqDoc.exists) {
      return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
    }

    await faqRef.update({
      question,
      answer,
      updatedAt: FieldValue.serverTimestamp(),
    });

    const updatedDoc = await faqRef.get();
    const updatedFaq = { id: updatedDoc.id, ...updatedDoc.data() };

    return NextResponse.json({ faq: updatedFaq }, { status: 200 });
  } catch (error: any) {
    console.error("Update FAQ error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update FAQ" },
      { status: 500 }
    );
  }
}

// DELETE /api/faqs - Delete FAQ (admin only)
export async function DELETE(req: NextRequest) {
  try {
    const adminResult = await verifyAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { searchParams } = new URL(req.url);
    const faqId = searchParams.get("faqId");

    if (!faqId) {
      return NextResponse.json(
        { error: "faqId is required" },
        { status: 400 }
      );
    }

    const faqRef = adminDb.collection("faqs").doc(faqId);
    await faqRef.delete();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Delete FAQ error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete FAQ" },
      { status: 500 }
    );
  }
}

