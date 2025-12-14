
import { db } from "@/lib/firebase/client";
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where, serverTimestamp } from "firebase/firestore";
import { storageService } from "./storage-service";
import type { Organizer, OrganizerApplication } from "@/lib/types";

export const organizerService = {

    async submitApplication(userId: string, application: OrganizerApplication, files: { [key: string]: File }) {
        try {
            // 1. Upload all files
            const uploadedFiles: { [key: string]: string } = {};

            for (const [key, file] of Object.entries(files)) {
                const path = `organizers/${userId}/documents/${key}_${Date.now()}_${file.name}`;
                const url = await storageService.uploadFile(file, path);
                uploadedFiles[key] = url;
            }

            // 2. Merge uploaded file URLs into the application object
            // We only merge keys that exist in the application object (which holds the file names currently)
            const applicationWithUrls = { ...application };

            // Explicitly map known file fields to their URLs
            if (files.businessPan) applicationWithUrls.businessPan = uploadedFiles.businessPan;
            if (files.gstCertificate) applicationWithUrls.gstCertificate = uploadedFiles.gstCertificate;
            if (files.businessRegistration) applicationWithUrls.businessRegistration = uploadedFiles.businessRegistration;
            if (files.bankStatement) applicationWithUrls.bankStatement = uploadedFiles.bankStatement;
            if (files.panCard) applicationWithUrls.panCard = uploadedFiles.panCard;
            if (files.idProof) applicationWithUrls.idProof = uploadedFiles.idProof;
            if (files.activityLicenses) applicationWithUrls.activityLicenses = uploadedFiles.activityLicenses;
            if (files.equipmentCertificates) applicationWithUrls.equipmentCertificates = uploadedFiles.equipmentCertificates;
            if (files.insuranceDocs) applicationWithUrls.insuranceDocs = uploadedFiles.insuranceDocs;
            if (files.staffCerts) applicationWithUrls.staffCerts = uploadedFiles.staffCerts;


            const organizerId = `org-${userId}`;
            const organizerRef = doc(db, "organizers", organizerId);

            const newOrganizer: Organizer = {
                id: organizerId,
                name: application.companyName || "New Organizer",
                avatar: "organizer1", // Default
                isVerified: false,
                status: "pending",
                partnerType: application.partnerType,
                application: applicationWithUrls,
                contactEmail: application.contactEmail,
                contactPhone: application.contactPhone,
                websiteUrl: application.website,
                joinedDate: new Date().toISOString(),
                commissionRate: 10, // Default global rate
            };

            await setDoc(organizerRef, newOrganizer);

            // Also update the user document to link to this organizer profile
            const userRef = doc(db, "users", userId);
            await updateDoc(userRef, {
                organizerId: organizerId,
                organizerStatus: "pending",
                organizerApplication: applicationWithUrls,
            });

            return organizerId;
        } catch (error) {
            console.error("Error submitting organizer application:", error);
            throw error;
        }
    },

    async getOrganizers(): Promise<Organizer[]> {
        try {
            const q = query(collection(db, "organizers"));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => doc.data() as Organizer);
        } catch (error) {
            console.error("Error fetching organizers:", error);
            throw error;
        }
    },

    async getOrganizer(organizerId: string): Promise<Organizer | null> {
        try {
            const docRef = doc(db, "organizers", organizerId);
            const snapshot = await getDoc(docRef);
            if (snapshot.exists()) {
                return snapshot.data() as Organizer;
            }
            return null;
        } catch (error) {
            console.error("Error fetching organizer:", error);
            throw error;
        }
    },

    async updateOrganizerStatus(organizerId: string, status: Organizer['status'], remarks?: string) {
        try {
            const organizerRef = doc(db, "organizers", organizerId);
            await updateDoc(organizerRef, {
                status,
                adminRemarks: remarks || null,
                updatedAt: serverTimestamp(),
            });

            // We should also update the linked user's status for easier frontend access
            // However, we'd need to know the User ID. 
            // In a real app, functions triggers would handle this sync.
            // For now, we assume the frontend re-fetches or we do a reverse lookup if critical.
        } catch (error) {
            console.error("Error updating organizer status:", error);
            throw error;
        }
    },

    async updateCommissionRate(organizerId: string, rate: number) {
        try {
            const organizerRef = doc(db, "organizers", organizerId);
            await updateDoc(organizerRef, {
                commissionRate: rate,
                updatedAt: serverTimestamp(),
            });
        } catch (error) {
            console.error("Error updating commission rate:", error);
            throw error;
        }
    }
};
