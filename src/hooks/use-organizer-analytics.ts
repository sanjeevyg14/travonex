
/**
 * @file This hook is a specialized data processor for the organizer analytics dashboard.
 * It encapsulates all business logic for calculating metrics, keeping the UI components clean.
 *
 * --- How It Works ---
 * 1.  **Data Consumption**: It uses `useAuth` and `useMockData` to get the logged-in user and the raw trip/booking data.
 * 2.  **Filtering**: It filters all platform data to isolate only the bookings and trips relevant to the current organizer.
 * 3.  **Data Aggregation & Memoization**: The entire calculation is wrapped in `useMemo`. This is critical for performance. The complex data processing only re-runs if the underlying data (bookings, trips, or user) changes.
 * 4.  **Calculates Core Stats**: It computes high-level metrics like total revenue, total bookings, and average revenue per booking.
 * 5.  **Computes Time-Series Data**: It aggregates revenue data by month for the last 6 months, formatting it perfectly for the `recharts` bar chart.
 * 6.  **Ranks Trip Performance**: It processes all of the organizer's trips to create two ranked lists: one for top trips by revenue and another by total number of bookings.
 */

"use client";

import { useMemo } from 'react';
import { useAuth } from './use-auth';
import { useMockData } from './use-mock-data';
import { format, subMonths, startOfMonth } from 'date-fns';

export function useOrganizerAnalytics() {
    const { user } = useAuth();
    const { trips, bookings } = useMockData();

    const analyticsData = useMemo(() => {
        if (!user || user.role !== 'organizer' || !user.organizerId) {
            return {
                stats: { totalRevenue: 0, totalBookings: 0, totalTravelers: 0, avgRevenuePerBooking: 0, activeTrips: 0 },
                monthlyRevenue: [],
                topTripsByRevenue: [],
                topTripsByBookings: [],
                recentBookings: [],
            };
        }

        const organizerTrips = trips.filter(t => t.organizer.id === user.organizerId);
        const organizerBookings = bookings.filter(b => b.organizerId === user.organizerId);

        // --- 1. Calculate Core Stats ---
        const totalRevenue = organizerBookings.reduce((acc, b) => acc + b.amountPaid, 0);
        const totalBookings = organizerBookings.length;
        const totalTravelers = organizerBookings.reduce((acc, b) => acc + b.numberOfTravelers, 0);
        const avgRevenuePerBooking = totalBookings > 0 ? totalRevenue / totalBookings : 0;
        const activeTrips = organizerTrips.filter(t => t.status === 'published').length;

        // --- 2. Calculate Monthly Revenue for the last 6 months ---
        const sixMonthsAgo = startOfMonth(subMonths(new Date(), 5));
        const monthlyRevenueMap = new Map<string, number>();

        // Initialize last 6 months in the map to ensure they appear even if there's no revenue
        for (let i = 0; i < 6; i++) {
            const monthDate = subMonths(new Date(), i);
            const monthKey = format(monthDate, 'MMM yyyy');
            monthlyRevenueMap.set(monthKey, 0);
        }

        organizerBookings.forEach(booking => {
            const bookingDate = new Date(booking.bookingDate);
            if (bookingDate >= sixMonthsAgo) {
                const monthKey = format(bookingDate, 'MMM yyyy');
                const currentRevenue = monthlyRevenueMap.get(monthKey) || 0;
                monthlyRevenueMap.set(monthKey, currentRevenue + booking.totalPrice);
            }
        });

        const monthlyRevenue = Array.from(monthlyRevenueMap.entries()).map(([month, totalRevenue]) => ({
            month,
            totalRevenue,
        }));
        
        // --- 3. Calculate Trip Performance ---
        const tripPerformance = organizerTrips.map(trip => {
            const tripBookings = organizerBookings.filter(b => b.tripId === trip.id);
            const tripRevenue = tripBookings.reduce((acc, b) => acc + b.totalPrice, 0);
            return {
                id: trip.id,
                title: trip.title,
                bookingsCount: tripBookings.length,
                totalRevenue: tripRevenue,
            };
        });

        const topTripsByRevenue = [...tripPerformance].sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 5);
        const topTripsByBookings = [...tripPerformance].sort((a, b) => b.bookingsCount - a.bookingsCount).slice(0, 5);
        
        // --- 4. Get Recent Bookings ---
        const recentBookings = [...organizerBookings]
            .sort((a,b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime())
            .slice(0, 5);

        return {
            stats: {
                totalRevenue,
                totalBookings,
                totalTravelers,
                avgRevenuePerBooking,
                activeTrips,
            },
            monthlyRevenue,
            topTripsByRevenue,
            topTripsByBookings,
            recentBookings,
        };

    }, [user, bookings, trips]);

    return analyticsData;
}
