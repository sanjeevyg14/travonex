import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminStorage } from "@/lib/firebase/admin";
import { verifySession } from "@/lib/auth/verify-session";
import type { OrganizerApplication } from "@/lib/types";

// POST /api/organizers/[organizerId]/application - Submit organizer application
export async function POST(
  req: NextRequest,
  { params }: { params: { organizerId: string } }
) {
  try {
    const authResult = await verifySession();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { organizerId } = params;
    const formData = await req.formData();

    // Extract file fields
    const files: { [key: string]: File } = {};
    const fileFields = [
      "panCard",
      "idProof",
      "businessPan",
      "gstCertificate",
      "businessRegistration",
      "bankStatement",
      "activityLicenses",
      "equipmentCertificates",
      "insuranceDocs",
      "staffCerts",
    ];

    for (const field of fileFields) {
      const file = formData.get(field) as File;
      if (file && file.size > 0) {
        files[field] = file;
      }
    }

    // Upload files to Firebase Storage using Admin SDK
    const uploadedFiles: { [key: string]: string } = {};
    const bucket = adminStorage.bucket();
    
    for (const [key, file] of Object.entries(files)) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const fileName = `${organizerId}/${key}_${Date.now()}_${file.name}`;
      const fileRef = bucket.file(`organizers/documents/${fileName}`);
      
      await fileRef.save(buffer, {
        metadata: {
          contentType: file.type,
        },
      });
      
      await fileRef.makePublic();
      const url = `https://storage.googleapis.com/${bucket.name}/${fileRef.name}`;
      uploadedFiles[key] = url;
    }

    // Extract application data
    const application: OrganizerApplication = {
      partnerType: formData.get("partnerType") as "trip" | "experience",
      organizerType: formData.get("organizerType") as "individual" | "business",
      companyName: formData.get("companyName") as string,
      experience: formData.get("experience") as string,
      website: formData.get("website") as string,
      contactName: formData.get("contactName") as string,
      contactEmail: formData.get("contactEmail") as string,
      contactPhone: formData.get("contactPhone") as string,
      bankAccountName: formData.get("bankAccountName") as string,
      bankAccountNumber: formData.get("bankAccountNumber") as string,
      bankIfscCode: formData.get("bankIfscCode") as string,
      ...uploadedFiles,
    };

    // Create or update organizer
    const organizerRef = adminDb.collection("organizers").doc(organizerId);
    await organizerRef.set(
      {
        id: organizerId,
        name: application.companyName,
        status: "pending",
        partnerType: application.partnerType,
        application,
        contactEmail: application.contactEmail,
        contactPhone: application.contactPhone,
        websiteUrl: application.website,
        joinedDate: new Date().toISOString(),
        commissionRate: 10,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    // Update user document
    const userRef = adminDb.collection("users").doc(authResult.user.uid);
    await userRef.update({
      organizerId,
      organizerStatus: "pending",
      organizerApplication: application,
    });

    return NextResponse.json({ success: true, organizerId }, { status: 201 });
  } catch (error: any) {
    console.error("Submit application error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit application" },
      { status: 500 }
    );
  }
}

