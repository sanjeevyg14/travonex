import { db } from "@/lib/firebase/client";
import { Trip, Batch } from "@/lib/types";
import { collection, doc, getDoc, getDocs, setDoc, query, where, orderBy, limit, startAfter, DocumentSnapshot } from "firebase/firestore";

export const tripService = {
    async getTrip(tripId: string): Promise<Trip | null> {
        const docRef = doc(db, "trips", tripId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Trip;
        }
        return null;
    },

    async createTrip(trip: Trip): Promise<void> {
        // Ensure ID is present, or generate one if strictly needed beforehand
        // Usually Firestore auto-generates, but we might want to use slug or specific ID
        await setDoc(doc(db, "trips", trip.id), trip);
    },

    async updateTrip(tripId: string, data: Partial<Trip>): Promise<void> {
        await setDoc(doc(db, "trips", tripId), data, { merge: true });
    },

    async getPublishedTrips(limitCount: number = 20, lastDoc?: DocumentSnapshot): Promise<{ trips: Trip[], lastDoc: DocumentSnapshot | null }> {
        let q = query(
            collection(db, "trips"),
            where("status", "==", "published"),
            orderBy("rating", "desc"), // Example ordering
            limit(limitCount)
        );

        if (lastDoc) {
            q = query(q, startAfter(lastDoc));
        }

        const querySnapshot = await getDocs(q);
        const trips = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Trip));

        return {
            trips,
            lastDoc: querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : null
        };
    },

    async getOrganizerTrips(organizerId: string): Promise<Trip[]> {
        const q = query(collection(db, "trips"), where("organizer.id", "==", organizerId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Trip));
    }
};
