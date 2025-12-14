
"use client";

import { TripCard } from "@/components/trip-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMockData } from "@/hooks/use-mock-data";
import { useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function SavedTripsPage() {
    const { trips, savedTrips: savedTripIds } = useMockData();
    const { user } = useAuth();

    const savedTrips = useMemo(() => {
        return trips.filter(trip => savedTripIds.includes(trip.id));
    }, [trips, savedTripIds]);

    if (!user) {
        return (
             <div className="container py-12 text-center">
                <h1 className="text-2xl font-bold">Please Log In</h1>
                <p className="text-muted-foreground mt-2">You need to be logged in to view your saved trips.</p>
                <Button asChild className="mt-4"><Link href="/login">Login</Link></Button>
            </div>
        )
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
