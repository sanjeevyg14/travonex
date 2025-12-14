import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function getPrivateKey() {
    const key = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
    if (!key) return undefined;

    // Check if it's base64 encoded (doesn't start with typical PEM header)
    if (!key.trim().startsWith("-----BEGIN PRIVATE KEY-----")) {
        try {
            return Buffer.from(key, 'base64').toString('utf-8');
        } catch (e) {
            console.warn("Failed to decode base64 private key", e);
            return key; // Fallback to returning original
        }
    }

    // Handle normal key with potential escaped newlines
    return key.replace(/\\n/g, "\n").trim();
}

const serviceAccount = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: getPrivateKey(),
};

if (!getApps().length) {
    if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
        try {
            initializeApp({
                credential: cert(serviceAccount),
            });
        } catch (error) {
            console.error("Firebase Admin initialization failed:", error);
        }
    } else {
        console.warn("Firebase Admin missing credentials, skipping init.");
    }
}

const adminAuth = getAuth();
const adminDb = getFirestore();

export { adminAuth, adminDb };
