/**
 * @file This hook is the business logic engine for the Admin Users Dashboard.
 * It encapsulates all data processing for users, providing a single source of truth for the UI.
 */

"use client";

import { useMemo, useState } from 'react';
import { useMockData } from './use-mock-data';
import type { User, Booking, Trip } from '@/lib/types';
import { subDays } from 'date-fns';

type SortableUserKeys = 'name' | 'totalBookings' | 'totalSpend' | 'joinDate';

type SortConfig = {
  key: SortableUserKeys;
  direction: 'ascending' | 'descending';
};

// Enriched Booking with trip for linking
type DialogBooking = Booking & { trip?: Trip };

// A "view model" for a user in the admin panel
export type EnrichedAdminUser = User & {
  totalBookings: number;
  totalSpend: number;
  bookings: DialogBooking[];
};

export function useAdminUsers() {
    const { bookings, users: allUsers, setUsers, trips } = useMockData();
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'totalSpend', direction: 'descending' });
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');


    const analytics = useMemo(() => {
        const userMap = new Map<string, EnrichedAdminUser>();

        // Initialize users from the now-separate users list
        allUsers.forEach(user => {
            userMap.set(user.id, {
                ...user,
                totalBookings: 0,
                totalSpend: 0,
                bookings: [],
            });
        });

        // Aggregate booking data onto the user map
        bookings.forEach(booking => {
            const userId = booking.travelerId || booking.travelerPhone; // Fallback for older data
            const user = userMap.get(userId);
            if (user) {
                user.totalBookings += 1;
                user.totalSpend += booking.totalPrice;
                
                // Enrich the booking with the trip object for the dialog link
                const tripForBooking = trips.find(t => t.id === booking.tripId);
                user.bookings.push({ ...booking, trip: tripForBooking });
            }
        });
        
        let enrichedUsers = Array.from(userMap.values());
        
        // Filtering logic
        if (searchQuery) {
            enrichedUsers = enrichedUsers.filter(user => 
                user.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        if (statusFilter !== 'all') {
            enrichedUsers = enrichedUsers.filter(user => user.status === statusFilter);
        }

        // Sorting logic
        enrichedUsers.sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (aValue === undefined || bValue === undefined) return 0;

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                 if (sortConfig.direction === 'ascending') {
                    return aValue.localeCompare(bValue);
                } else {
                    return bValue.localeCompare(aValue);
                }
            }
            
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                 if (sortConfig.direction === 'ascending') {
                    return aValue - bValue;
                } else {
                    return bValue - aValue;
                }
            }

            return 0;
        });

        const totalTravelers = allUsers.length;
        const totalSpend = Array.from(userMap.values()).reduce((acc, user) => acc + user.totalSpend, 0);

        return {
            stats: {
                totalTravelers,
                totalSpend,
            },
            users: enrichedUsers,
        };

    }, [bookings, allUsers, sortConfig, searchQuery, statusFilter, trips]);

    const requestSort = (key: SortableUserKeys) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const updateUserStatus = (userId: string, status: 'active' | 'suspended') => {
        setUsers(currentUsers => currentUsers.map(u => u.id === userId ? {...u, status} : u));
    }

    return { 
        ...analytics, 
        requestSort, 
        sortConfig, 
        updateUserStatus,
        setSearchQuery,
        setStatusFilter,
    };
}
