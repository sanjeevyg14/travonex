import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifyAdmin } from "@/lib/auth/admin-guard";
import { FieldValue } from "firebase-admin/firestore";
import type { LeadPackage } from "@/lib/types";
import { z } from "zod";

const createLeadPackageSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  credits: z.number().positive("Credits must be positive"),
  price: z.number().positive("Price must be positive"),
  originalPrice: z.number().optional(),
  popular: z.boolean().default(false),
});

// GET /api/lead-packages - Get lead packages (public)
export async function GET(req: NextRequest) {
  try {
    const snapshot = await adminDb
      .collection("lead_packages")
      .orderBy("price", "asc")
      .get();

    const packages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ packages }, { status: 200 });
  } catch (error: any) {
    console.error("Get lead packages error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch packages" },
      { status: 500 }
    );
  }
}

// POST /api/lead-packages - Create lead package (admin only)
export async function POST(req: NextRequest) {
  try {
    const adminResult = await verifyAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const body = await req.json();
    const result = createLeadPackageSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const packageData = result.data;
    const packageRef = adminDb.collection("lead_packages").doc();
    await packageRef.set({
      ...packageData,
      originalPrice: packageData.originalPrice || packageData.price,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json(
      { package: { id: packageRef.id, ...packageData } },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create lead package error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create package" },
      { status: 500 }
    );
  }
}

// PUT /api/lead-packages - Update lead package (admin only)
export async function PUT(req: NextRequest) {
  try {
    const adminResult = await verifyAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const body = await req.json();
    const { packageId, ...updateData } = body;

    if (!packageId) {
      return NextResponse.json(
        { error: "packageId is required" },
        { status: 400 }
      );
    }

    const packageRef = adminDb.collection("lead_packages").doc(packageId);
    const packageDoc = await packageRef.get();

    if (!packageDoc.exists) {
      return NextResponse.json(
        { error: "Package not found" },
        { status: 404 }
      );
    }

    await packageRef.update({
      ...updateData,
      updatedAt: FieldValue.serverTimestamp(),
    });

    const updatedDoc = await packageRef.get();
    const updatedPackage = { id: updatedDoc.id, ...updatedDoc.data() };

    return NextResponse.json({ package: updatedPackage }, { status: 200 });
  } catch (error: any) {
    console.error("Update lead package error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update package" },
      { status: 500 }
    );
  }
}

// DELETE /api/lead-packages - Delete lead package (admin only)
export async function DELETE(req: NextRequest) {
  try {
    const adminResult = await verifyAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { searchParams } = new URL(req.url);
    const packageId = searchParams.get("packageId");

    if (!packageId) {
      return NextResponse.json(
        { error: "packageId is required" },
        { status: 400 }
      );
    }

    const packageRef = adminDb.collection("lead_packages").doc(packageId);
    await packageRef.get().then((doc) => {
      if (doc.exists) {
        return packageRef.delete();
      }
      throw new Error("Package not found");
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Delete lead package error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete package" },
      { status: 500 }
    );
  }
}

