"use client";

import { TripCard } from "@/components/trip-card";
import { tripService } from "@/services/trip-service";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import type { Trip } from "@/lib/types";

export function TrendingTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrips() {
      try {
        const { trips: fetchedTrips } = await tripService.getPublishedTrips(8);
        setTrips(fetchedTrips);
      } catch (error) {
        console.error("Failed to fetch trending trips", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTrips();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  if (trips.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="flex justify-between items-center mb-8">
        <div className="text-left">
          <h2 className="text-3xl font-bold tracking-tight">Trending Trips This Week</h2>
          <p className="mt-2 text-lg text-muted-foreground">
            Popular adventures booked by fellow travelers.
          </p>
        </div>
        <Button variant="ghost" asChild className="hidden md:flex">
          <Link href="/discover">
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {trips.map((trip) => (
            <CarouselItem key={trip.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
              <div className="p-1 h-full">
                <TripCard trip={trip} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
      <div className="text-center mt-8 md:hidden">
        <Button variant="outline" asChild>
          <Link href="/discover">
            View All Trips
          </Link>
        </Button>
      </div>
    </section>
  );
}
