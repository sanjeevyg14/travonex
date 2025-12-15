
"use client";

import { TripCard } from "@/components/trip-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { apiGet } from "@/lib/api-client";
import type { Trip } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function SavedTripsPage() {
    const { user } = useAuth();
    const [savedTrips, setSavedTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSavedTrips() {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const data = await apiGet<{ savedTrips: Trip[] }>(`/api/users/${user.id}/saved-trips`);
                setSavedTrips(data.savedTrips || []);
            } catch (error) {
                console.error("Failed to fetch saved trips:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchSavedTrips();
    }, [user]);

    if (!user) {
        return (
             <div className="container py-12 text-center">
                <h1 className="text-2xl font-bold">Please Log In</h1>
                <p className="text-muted-foreground mt-2">You need to be logged in to view your saved trips.</p>
                <Button asChild className="mt-4"><Link href="/login">Login</Link></Button>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="container py-12 space-y-8">
                <div>
                    <Skeleton className="h-9 w-64 mb-2" />
                    <Skeleton className="h-5 w-96" />
                </div>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-32 mb-2" />
                        <Skeleton className="h-4 w-48" />
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <Skeleton key={i} className="h-80 w-full" />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container py-12 space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Saved Trips</h1>
                <p className="text-muted-foreground">Your travel wishlist. Plan your next adventure here!</p>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Your Wishlist</CardTitle>
                    <CardDescription>Trips you have saved for later.</CardDescription>
                </CardHeader>
                <CardContent>
                     {savedTrips.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {savedTrips.map(trip => (
                                <TripCard key={trip.id} trip={trip} />
                            ))}
                        </div>
                     ) : (
                        <div className="text-center py-12">
                            <h3 className="text-lg font-semibold">Your wishlist is empty.</h3>
                            <p className="text-muted-foreground mt-2">Start exploring to find and save trips you love!</p>
                            <Button asChild className="mt-4">
                                <Link href="/discover">Explore Trips</Link>
                            </Button>
                        </div>
                     )}
                </CardContent>
            </Card>
        </div>
    )
}
