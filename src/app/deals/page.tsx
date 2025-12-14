
"use client";

import { useMemo, useState, useEffect } from "react";
import { useMockData } from "@/hooks/use-mock-data";
import { useAuth } from "@/hooks/use-auth";
import { TripCard } from "@/components/trip-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Crown, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import type { Trip } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";


function LockedDealCard({ trip }: { trip: Trip }) {
    const placeholder = PlaceHolderImages.find((p) => p.id === trip.image);
    const activeDealBatch = useMemo(() => {
        return trip.batches?.find(b => b.isLastMinuteDeal && b.status === 'Active');
    }, [trip.batches]);

    if (!activeDealBatch) return null;

    return (
        <Card className="relative overflow-hidden group">
            {/* The blurred background card */}
            <TripCard trip={trip} />

            {/* The "Glass" Overlay */}
            <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center z-10">
                <div className="border-2 border-dashed border-primary/50 rounded-lg p-6 space-y-4">
                    <div className="flex justify-center">
                        <div className="bg-primary/10 p-3 rounded-full">
                            <Lock className="h-6 w-6 text-primary" />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold">Unlock with Travonex Pro</h3>
                    
                    <div className="flex items-baseline justify-center gap-2">
                        <span className="text-2xl font-bold text-primary">₹{activeDealBatch.dealPrice?.toLocaleString('en-IN')}</span>
                        <span className="text-lg text-muted-foreground line-through">₹{trip.price.toLocaleString('en-IN')}</span>
                    </div>

                    <p className="text-sm text-muted-foreground">Upgrade to access this and other exclusive last-minute deals.</p>
                    
                    <Button asChild className="w-full">
                        <Link href="/pro">
                            <Crown className="mr-2 h-4 w-4" />
                            Upgrade to Pro
                        </Link>
                    </Button>
                </div>
            </div>
        </Card>
    );
}

export default function DealsPage() {
    const { trips } = useMockData();
    const { user } = useAuth();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const dealTrips = useMemo(() => {
        return trips.filter(trip => 
            trip.status === 'published' && 
            trip.batches?.some(b => b.isLastMinuteDeal && b.status === 'Active')
        );
    }, [trips]);

    const isProUser = user?.subscriptionTier === 'pro';
    
    const renderSkeletons = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                    <Skeleton className="h-52 w-full" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            ))}
        </div>
    );

    return (
        <div className="container py-12">
            <div className="text-center mb-12 max-w-2xl mx-auto">
                <h1 className="text-4xl font-bold tracking-tight text-primary flex items-center justify-center gap-3">
                    <Crown /> Last-Minute Getaways
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    Spontaneous adventures at unbeatable prices. Exclusively for our Pro members.
                </p>
            </div>

            {!isClient ? renderSkeletons() : (
                 dealTrips.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {dealTrips.map(trip => 
                            isProUser ? (
                                <TripCard key={trip.id} trip={trip} />
                            ) : (
                                <LockedDealCard key={trip.id} trip={trip} />
                            )
                        )}
                    </div>
                ) : (
                     <div className="text-center py-16">
                        <h2 className="text-2xl font-semibold">No Deals Right Now</h2>
                        <p className="text-muted-foreground mt-2">Check back soon for new last-minute adventures!</p>
                    </div>
                )
            )}
        </div>
    );
}
