/**
 * @file This component renders a visually engaging empty state message.
 * It's designed to be used on pages like "My Bookings" or "Saved Trips" when there is no content to display.
 *
 * --- How It Works ---
 * 1.  **Props**: It accepts an `icon`, `title`, `description`, and a `button` ReactNode.
 * 2.  **Slot-based Design**: It uses props to allow for flexible content, making it highly reusable across the application.
 * 3.  **Trending Trips**: It fetches the first three published trips and displays them as recommendations,
 *     turning a dead-end page into a discovery opportunity. This helps re-engage the user immediately.
 */

"use client";

import { useMockData } from "@/hooks/use-mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { TripCard } from "./trip-card";

interface EmptyStateProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    actionButton: React.ReactNode;
}

export function EmptyState({ icon, title, description, actionButton }: EmptyStateProps) {
    const { trips } = useMockData();
    // Suggest a few trending trips to the user to prevent a dead end.
    const suggestedTrips = trips.filter(trip => trip.status === 'published').slice(0, 3);
    
    return (
        <div className="text-center">
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                    {icon}
                </div>
                <h3 className="mt-6 text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-muted-foreground">{description}</p>
                <div className="mt-6">
                    {actionButton}
                </div>
            </div>

            {suggestedTrips.length > 0 && (
                <div className="mt-12">
                    <h3 className="text-2xl font-bold text-left mb-6">You Might Like</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {suggestedTrips.map(trip => (
                            <TripCard key={trip.id} trip={trip} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}