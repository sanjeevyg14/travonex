

/**
 * @file This hook is the business logic engine for the Admin Dashboard.
 * It encapsulates all data processing, providing a single, clean source of truth for the UI.
 *
 * --- How It Works ---
 * 1.  **Data Consumption**: It uses `useMockData` to get the raw data streams (trips, bookings, organizers).
 * 2.  **Centralized Calculations**: It performs all financial and operational calculations in one place.
 *     - **Financial KPIs**: Calculates total gross revenue (GMV) and platform commission.
 *     - **Operational KPIs**: Calculates totals for trips, organizers, and bookings.
 * 3.  **Actionable Activity Feed**: It creates a unified list of the most recent activities (new bookings, pending trips) that require admin attention, complete with action URLs.
 * 4.  **Memoization**: All expensive calculations are wrapped in `useMemo`. This is a critical performance optimization that ensures the data is only re-calculated when the underlying source data changes.
 */

"use client";

import { useMemo } from 'react';
import { useMockData } from './use-mock-data';
import { Trip, Booking } from '@/lib/types';

// A unified type for the "Recent Activity" feed
export type AdminActivity = {
  id: string;
  type: 'New Booking' | 'Pending Trip';
  title: string;
  subtitle: string;
  date: string;
  value: string;
  actionUrl: string;
};


export function useAdminAnalytics() {
    const { trips, bookings, organizers, commissionRate } = useMockData();

    const analytics = useMemo(() => {
        // --- Financial KPIs (CFO Focus) ---
        const totalRevenue = bookings.reduce((acc, booking) => acc + booking.totalPrice, 0);
        const platformCommission = totalRevenue * (commissionRate / 100);
        const totalCashback = bookings.filter(b => b.cashbackStatus === 'processed').reduce((acc, b) => acc + (b.cashbackAmount || 0), 0);

        // --- Operational KPIs (CEO Focus) ---
        const totalTrips = trips.length;
        const totalOrganizers = Object.keys(organizers).length;
        const totalBookings = bookings.length;
        const pendingApprovals = trips.filter(trip => trip.status === 'pending').length;

        // --- Recent Activity Feed (CTO & UX Focus) ---
        const recentBookings = bookings
            .slice() // Create a shallow copy to avoid mutating the original array
            .sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime())
            .slice(0, 5)
            .map((booking): AdminActivity => ({
                id: `activity-booking-${booking.id}`,
                type: 'New Booking',
                title: `${booking.travelerName} booked ${booking.tripTitle}`,
                subtitle: `by ${trips.find(t => t.id === booking.tripId)?.organizer.name || 'Unknown Organizer'}`,
                date: booking.bookingDate,
                value: `+ ₹${booking.totalPrice.toLocaleString('en-IN')}`,
                actionUrl: `/management/bookings`,
            }));
            
        const pendingTrips = trips
            .filter(trip => trip.status === 'pending')
            .slice(0, 5)
            .map((trip): AdminActivity => ({
                id: `activity-trip-${trip.id}`,
                type: 'Pending Trip',
                title: `${trip.title} submitted`,
                subtitle: `by ${trip.organizer.name}`,
                date: new Date().toISOString(), // Mock submission date
                value: 'Needs Review',
                actionUrl: `/management/trips`,
            }));

        const recentActivity = [...pendingTrips, ...recentBookings]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 7); // Limit to a total of 7 recent items

        return {
            stats: {
                totalRevenue,
                platformCommission,
                totalCashback,
                totalTrips,
                totalOrganizers,
                totalBookings,
                pendingApprovals,
            },
            recentActivity,
        };

    }, [trips, bookings, organizers, commissionRate]);

    return analytics;
}
