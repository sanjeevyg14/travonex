import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth/verify-session";
import { adminStorage } from "@/lib/firebase/admin";

// POST /api/upload - Upload file to Firebase Storage
export async function POST(req: NextRequest) {
  try {
    const authResult = await verifySession();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "uploads";

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type (images only for now)
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Firebase Storage using Admin SDK
    const fileName = `${Date.now()}_${file.name.replace(/\s/g, "_")}`;
    const bucket = adminStorage.bucket();
    const fileRef = bucket.file(`${folder}/${fileName}`);

    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    });

    // Make file public and get download URL
    await fileRef.makePublic();
    const downloadURL = `https://storage.googleapis.com/${bucket.name}/${fileRef.name}`;

    return NextResponse.json(
      {
        url: downloadURL,
        path: fileRef.name,
        fileName: fileName,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}

