
/**
 * @file This hook is a specialized data processor for the experience vendor analytics dashboard.
 */

"use client";

import { useMemo } from 'react';
import { useAuth } from './use-auth';
import { useMockData } from './use-mock-data';
import { format, subMonths, startOfMonth } from 'date-fns';

export function useExperienceAnalytics() {
    const { user } = useAuth();
    const { experiences, experienceBookings } = useMockData();

    const analyticsData = useMemo(() => {
        if (!user || user.role !== 'organizer' || !user.organizerId) {
            return {
                stats: { totalRevenue: 0, totalBookings: 0, totalParticipants: 0, avgRevenuePerBooking: 0, activeExperiences: 0 },
                monthlyRevenue: [],
                topExperiencesByRevenue: [],
                topExperiencesByBookings: [],
                recentBookings: [],
            };
        }

        const vendorExperiences = experiences.filter(e => e.vendor.id === user.organizerId);
        const vendorExperienceIds = vendorExperiences.map(e => e.id);
        const vendorBookings = experienceBookings.filter(b => vendorExperienceIds.includes(b.experienceId));
        
        // --- 1. Calculate Core Stats based on Base Price ---
        const totalRevenue = vendorBookings.reduce((acc, b) => {
            const experience = vendorExperiences.find(e => e.id === b.experienceId);
            const basePrice = experience?.price || 0;
            return acc + (basePrice * b.participants);
        }, 0);

        const totalBookings = vendorBookings.length;
        const totalParticipants = vendorBookings.reduce((acc, b) => acc + b.participants, 0);
        const avgRevenuePerBooking = totalBookings > 0 ? totalRevenue / totalBookings : 0;
        const activeExperiences = vendorExperiences.length; // Assuming all are active for now

        // --- 2. Calculate Monthly Revenue for the last 6 months ---
        const sixMonthsAgo = startOfMonth(subMonths(new Date(), 5));
        const monthlyRevenueMap = new Map<string, number>();

        for (let i = 0; i < 6; i++) {
            const monthDate = subMonths(new Date(), i);
            const monthKey = format(monthDate, 'MMM yyyy');
            monthlyRevenueMap.set(monthKey, 0);
        }

        vendorBookings.forEach(booking => {
            const bookingDate = new Date(booking.bookingDate);
            if (bookingDate >= sixMonthsAgo) {
                const monthKey = format(bookingDate, 'MMM yyyy');
                const currentRevenue = monthlyRevenueMap.get(monthKey) || 0;
                const experience = vendorExperiences.find(e => e.id === booking.experienceId);
                const basePrice = experience?.price || 0;
                monthlyRevenueMap.set(monthKey, currentRevenue + (basePrice * booking.participants));
            }
        });

        const monthlyRevenue = Array.from(monthlyRevenueMap.entries()).map(([month, totalRevenue]) => ({
            month,
            totalRevenue,
        }));
        
        // --- 3. Calculate Experience Performance ---
        const experiencePerformance = vendorExperiences.map(exp => {
            const expBookings = vendorBookings.filter(b => b.experienceId === exp.id);
            const expRevenue = expBookings.reduce((acc, b) => acc + (exp.price * b.participants), 0);
            const participantsCount = expBookings.reduce((acc, b) => acc + b.participants, 0);
            return {
                id: exp.id,
                title: exp.title,
                participantsCount,
                totalRevenue: expRevenue,
            };
        });

        const topExperiencesByRevenue = [...experiencePerformance].sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 5);
        const topExperiencesByBookings = [...experiencePerformance].sort((a, b) => b.participantsCount - a.participantsCount).slice(0, 5);
        
        // --- 4. Get Recent Bookings ---
        const recentBookings = [...vendorBookings]
            .sort((a,b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime())
            .slice(0, 5);

        return {
            stats: {
                totalRevenue,
                totalBookings,
                totalParticipants,
                avgRevenuePerBooking,
                activeExperiences,
            },
            monthlyRevenue,
            topExperiencesByRevenue,
            topExperiencesByBookings,
            recentBookings,
        };

    }, [user, experienceBookings, experiences]);

    return analyticsData;
}
