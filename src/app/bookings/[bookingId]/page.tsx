import { notFound } from "next/navigation";
import { initialBookings, initialTrips } from "@/lib/data";
import BookingDetailsClient from "./booking-details-client";
import type { EnrichedBooking } from "@/hooks/use-user-bookings";

export async function generateStaticParams() {
  // In a real app, you might fetch only published/valid booking IDs
  return initialBookings.map(booking => ({
    bookingId: booking.id,
  }));
}

async function getBookingData(bookingId: string) {
    const booking = initialBookings.find(b => b.id === bookingId);
    if (!booking) return null;

    const trip = initialTrips.find(t => t.id === booking.tripId);
    const batch = trip?.batches?.find(b => b.id === booking.batchId);

    // Return an enriched booking object similar to what the client hook was doing
    return {
        ...booking,
        trip,
        batch
    }
}

export default async function BookingDetailPage({ params }: { params: { bookingId: string } }) {
    const booking = await getBookingData(params.bookingId);

    if (!booking) {
        notFound();
    }
    
    // Pass the server-fetched data to the client component as a prop
    return <BookingDetailsClient booking={booking as EnrichedBooking} />;
}
