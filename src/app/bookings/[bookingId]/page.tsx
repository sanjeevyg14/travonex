import { notFound } from "next/navigation";
import BookingDetailsClient from "./booking-details-client";
import { apiGet } from "@/lib/api-client";
import type { Booking, Trip } from "@/lib/types";

async function getBookingData(bookingId: string) {
    try {
        const bookingData = await apiGet<{ booking: Booking }>(`/api/bookings/${bookingId}`);
        const booking = bookingData.booking;

        // Fetch trip details
        const tripData = await apiGet<{ trip: Trip }>(`/api/trips/${booking.tripId}`);
        const trip = tripData.trip;

        const batch = trip.batches?.find(b => b.id === booking.batchId);

        return {
            ...booking,
            trip,
            batch,
        };
    } catch (error) {
        console.error("Failed to fetch booking:", error);
        return null;
    }
}

export default async function BookingDetailPage({ params }: { params: { bookingId: string } }) {
    const booking = await getBookingData(params.bookingId);

    if (!booking) {
        notFound();
    }
    
    return <BookingDetailsClient booking={booking} />;
}
