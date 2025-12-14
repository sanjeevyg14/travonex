import { db } from "@/lib/firebase/client";
import { Booking } from "@/lib/types";
import { collection, doc, getDoc, getDocs, setDoc, query, where, updateDoc, increment, runTransaction } from "firebase/firestore";

export const bookingService = {
    async createBooking(booking: Booking): Promise<void> {
        // Transactional booking creation to ensure slot availability
        await runTransaction(db, async (transaction) => {
            const tripRef = doc(db, "trips", booking.tripId);
            const tripDoc = await transaction.get(tripRef);

            if (!tripDoc.exists()) {
                throw "Trip does not exist!";
            }

            const tripData = tripDoc.data();
            const batches = tripData.batches || [];
            const batchIndex = batches.findIndex((b: any) => b.id === booking.batchId);

            if (batchIndex === -1) {
                throw "Batch not found!";
            }

            const batch = batches[batchIndex];
            if (batch.availableSlots < booking.numberOfTravelers) {
                throw "Not enough slots available!";
            }

            // Decrement slots locally
            batches[batchIndex].availableSlots -= booking.numberOfTravelers;
            if (batches[batchIndex].availableSlots === 0) {
                batches[batchIndex].status = "Full";
            }

            // Update Trip
            transaction.update(tripRef, { batches: batches });

            // Create Booking
            const bookingRef = doc(db, "bookings", booking.id);
            transaction.set(bookingRef, booking);
        });
    },

    async getBooking(bookingId: string): Promise<Booking | null> {
        const docRef = doc(db, "bookings", bookingId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Booking;
        }
        return null;
    },

    async getUserBookings(userId: string): Promise<Booking[]> {
        const q = query(collection(db, "bookings"), where("travelerId", "==", userId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Booking));
    }
};
