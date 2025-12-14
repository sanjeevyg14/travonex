/**
 * @file This hook is a specialized data processor for handling user bookings.
 * It's a prime example of a "selector" hook that encapsulates business logic,
 * making the UI components cleaner and more focused on presentation.
 *
 * --- How It Works ---
 * 1.  **Data Fetching**: It consumes the global `useAuth` and `useMockData` hooks to get the current user and the master list of all bookings and trips.
 * 2.  **Filtering**: It filters the master booking list to find only the bookings that belong to the currently authenticated user.
 * 3.  **Enrichment**: It "enriches" each booking by finding and attaching the corresponding full Trip and Batch objects. This prevents components from having to do this lookup themselves.
 * 4.  **Business Logic**: It applies critical business logic, such as:
 *     - Calculating if a booking is 'Cancelled' due to a missed payment deadline.
 *     - Determining if a booking is 'Upcoming' or 'Completed' based on the trip's end date.
 * 5.  **Sorting**: It sorts the upcoming and completed bookings lists for a clean, logical presentation in the UI.
 * 6.  **Memoization**: The entire calculation is wrapped in `useMemo`, which means this expensive processing only re-runs if the user, bookings, or trips data actually changes, optimizing performance.
 */

"use client";

import { useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMockData } from "@/hooks/use-mock-data";
import type { Booking, Trip, Batch } from "@/lib/types";
import { addDays, isBefore, startOfDay } from "date-fns";

// This "Enriched" type combines booking data with the related trip and batch details.
// It's a "view model" created specifically for the UI.
export type EnrichedBooking = Booking & {
  trip?: Trip;
  batch?: Batch;
  isCancelled?: boolean; // A calculated field.
  dueDate?: Date;        // A calculated field.
};

/**
 * A dedicated hook to manage all logic for fetching and processing a user's bookings.
 */
export function useUserBookings() {
  const { user } = useAuth();
  const { trips, bookings } = useMockData();

  // useMemo ensures this complex calculation only runs when its dependencies (user, bookings, trips) change.
  const processedBookings = useMemo(() => {
    // If there's no user, return empty arrays.
    if (!user?.phone) {
      return { upcomingBookings: [], completedBookings: [] };
    }

    const now = new Date();
    const today = startOfDay(now);
    const upcoming: EnrichedBooking[] = [];
    const completed: EnrichedBooking[] = [];

    // 1. Filter all bookings to get only the ones for the current user.
    const userBookings = bookings.filter(
      (booking) => booking.travelerPhone === user.phone
    );

    // 2. Process each of the user's bookings using a robust map/filter approach
    const enrichedBookings = userBookings.map((booking) => {
        const trip = trips.find((t) => t.id === booking.tripId);
        // Note: We don't filter out bookings with missing trips/batches to ensure
        // the user can still see a record of their booking even if the trip was deleted.
        const batch = trip?.batches?.find((b) => b.id === booking.batchId);
        
        const enrichedBooking: EnrichedBooking = { ...booking, trip, batch };

        // 4. Apply Cancellation Logic
        if (booking.paymentStatus === "Reserved" && trip?.balanceDueDays !== undefined && batch) {
            const startDate = new Date(batch.startDate);
            const dueDate = addDays(startDate, -trip.balanceDueDays);
            enrichedBooking.dueDate = dueDate;
            if (isBefore(dueDate, now)) {
              enrichedBooking.isCancelled = true;
            }
        }
        
        return enrichedBooking;
    });

    
    enrichedBookings.forEach(enrichedBooking => {
      // If the batch or trip is missing, we categorize it as completed/archived.
      if (!enrichedBooking.batch) {
          completed.push(enrichedBooking);
          return;
      }
      
      // 5. Categorize into "Upcoming" or "Completed"
      // A trip is considered "past" only if its end date is strictly before today.
      const isPastTrip = new Date(enrichedBooking.batch.endDate) < today;

      if (isPastTrip || enrichedBooking.isCancelled) {
        completed.push(enrichedBooking);
      } else {
        upcoming.push(enrichedBooking);
      }
    });


    // 6. Sort the lists for display.
    upcoming.sort(
      (a, b) =>
        new Date(a.batch!.startDate).getTime() -
        new Date(b.batch!.startDate).getTime()
    );

    completed.sort(
      (a, b) =>
        new Date(b.batch!.endDate).getTime() -
        new Date(a.batch!.endDate).getTime()
    );

    return { upcomingBookings: upcoming, completedBookings: completed };
  }, [user, bookings, trips]);

  return processedBookings;
}
