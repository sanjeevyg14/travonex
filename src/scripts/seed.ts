import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars from .env.local in the root directory
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { initialTrips, initialUsers, initialExperiences, initialOrganizers } from "../lib/data";

async function seed() {
    const pk = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
    if (!pk) {
        console.error("Private Key missing!");
    } else {
        console.log("Private Key length:", pk.length);
        console.log("First 50 chars:", pk.substring(0, 50));
        console.log("Contains real newline?", pk.includes('\n'));
        console.log("Contains literal \\n?", pk.includes('\\n'));
    }

    // Dynamically import adminDb
    const { adminDb } = await import("../lib/firebase/admin");

    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
        throw new Error("NEXT_PUBLIC_FIREBASE_PROJECT_ID is missing.");
    }

    console.log("Seeding database...");

    // Seed Users
    for (const user of initialUsers) {
        if (user.id) {
            await adminDb.collection("users").doc(user.id).set(user);
        }
    }
    console.log("Users seeded.");

    // Seed Organizers
    for (const [id, organizer] of Object.entries(initialOrganizers)) {
        await adminDb.collection("organizers").doc(id).set(organizer);
    }
    console.log("Organizers seeded.");

    // Seed Trips
    for (const trip of initialTrips) {
        await adminDb.collection("trips").doc(trip.id).set(trip);
    }
    console.log("Trips seeded.");

    // Seed Experiences
    for (const exp of initialExperiences) {
        await adminDb.collection("experiences").doc(exp.id).set(exp);
    }
    console.log("Experiences seeded.");

    console.log("Done!");
    process.exit(0);
}

seed().catch(console.error);
