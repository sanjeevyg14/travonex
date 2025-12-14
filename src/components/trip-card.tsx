
"use client";

import type { Trip } from "@/lib/types";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { MapPin, Star, Heart, Zap } from "lucide-react";
import { Badge } from "./ui/badge";
import { useMockData } from "@/hooks/use-mock-data";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface TripCardProps {
  trip: Trip;
}

export function TripCard({ trip }: TripCardProps) {
  const placeholder = PlaceHolderImages.find((p) => p.id === trip.image);
  const { savedTrips, toggleSaveTrip } = useMockData();
  const isSaved = savedTrips.includes(trip.id);

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSaveTrip(trip.id);
  }

  const { totalReviews, averageRating } = useMemo(() => {
    const reviews = trip.reviews || [];
    const total = reviews.length;
    if (total === 0) {
      return { totalReviews: 0, averageRating: 0 };
    }
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    const avg = sum / total;
    return { totalReviews: total, averageRating: parseFloat(avg.toFixed(1)) };
  }, [trip.reviews]);
  
  const activeDealBatch = useMemo(() => {
    return trip.batches?.find(b => b.isLastMinuteDeal && b.status === 'Active');
  }, [trip.batches]);

  return (
    <Link href={`/discover/${trip.slug}`} className="group block">
      <Card className="overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 h-full flex flex-col">
        <CardHeader className="p-0">
          <div className="relative h-52 w-full">
            {placeholder && (
              <Image
                src={placeholder.imageUrl}
                alt={placeholder.description}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint={placeholder.imageHint}
              />
            )}
            <div className="absolute top-3 left-3 space-x-2">
                <Badge variant="secondary">{trip.category}</Badge>
                 {activeDealBatch && (
                    <Badge variant="destructive" className="animate-pulse gap-1">
                        <Zap className="h-3 w-3"/> DEAL
                    </Badge>
                )}
            </div>

             {/* Mobile usability refinement - Ensure heart icon has a large tap target */}
             <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 rounded-full h-10 w-10 bg-white/80 text-primary hover:bg-white hover:text-primary"
                onClick={handleSaveClick}
              >
                <Heart className={cn("h-5 w-5 transition-colors", isSaved ? 'fill-primary' : 'fill-transparent')} />
              </Button>
          </div>
        </CardHeader>
        {/* Mobile layout refinement - Increase title font size for better hierarchy */}
        <CardContent className="p-4 space-y-2 flex-grow">
          <CardTitle className="text-lg md:text-xl font-semibold leading-tight group-hover:text-primary">
            {trip.title}
          </CardTitle>
          <p className="text-sm text-muted-foreground line-clamp-2">{trip.shortDescription}</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
            <MapPin className="h-4 w-4" />
            <span>{trip.location}</span>
          </div>
        </CardContent>
        <CardFooter className="p-4 flex justify-between items-center bg-muted/50">
          <div className="text-lg font-bold">
            {activeDealBatch?.dealPrice ? (
                <div className="flex items-baseline gap-2">
                    <span className="text-primary">₹{activeDealBatch.dealPrice.toLocaleString('en-IN')}</span>
                    <span className="text-sm text-muted-foreground line-through">₹{trip.price.toLocaleString('en-IN')}</span>
                </div>
            ) : (
                <>
                 ₹{trip.price.toLocaleString('en-IN')}
                 <span className="text-sm font-normal text-muted-foreground">/person</span>
                </>
            )}
          </div>
          {totalReviews > 0 ? (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="font-semibold">{averageRating}</span>
              <span className="text-sm text-muted-foreground">({totalReviews})</span>
            </div>
          ) : (
             <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-muted-foreground/30" />
              <span className="text-sm text-muted-foreground">New</span>
            </div>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
