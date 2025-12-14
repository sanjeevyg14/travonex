"use client";

import { experienceService } from "@/services/experience-service";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import type { Experience } from "@/lib/types";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";

function ExperienceCard({ experience }: { experience: Experience }) {
  const placeholder = PlaceHolderImages.find(p => p.id === experience.images[0]);

  const { totalReviews, averageRating } = useMemo(() => {
    const reviews = experience.reviews || [];
    const total = reviews.length;
    if (total === 0) {
      return { totalReviews: 0, averageRating: 0 };
    }
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    const avg = sum / total;
    return { totalReviews: total, averageRating: parseFloat(avg.toFixed(1)) };
  }, [experience.reviews]);

  return (
    <Link href={`/experiences/${experience.slug}`} className="group block h-full">
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
            <div className="absolute top-3 left-3">
              <Badge variant="secondary">{experience.category}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-2 flex-grow">
          <CardTitle className="text-lg font-semibold leading-tight group-hover:text-primary">
            {experience.title}
          </CardTitle>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {experience.location}
          </p>
        </CardContent>
        <CardFooter className="p-4 flex justify-between items-center bg-muted/50 border-t">
          <div>
            <p className="text-sm text-muted-foreground">Starts from</p>
            <p className="text-lg font-bold">₹{experience.price.toLocaleString('en-IN')}</p>
          </div>
          {totalReviews > 0 ? (
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="font-semibold">{averageRating}</span>
              <span className="text-muted-foreground">({totalReviews})</span>
            </div>
          ) : (
            <Badge variant="outline">New</Badge>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}

export function TopExperiences() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchExperiences() {
      try {
        const fetched = await experienceService.getTopExperiences();
        setExperiences(fetched);
      } catch (e) {
        console.error("Failed to fetch top experiences", e);
      } finally {
        setLoading(false);
      }
    }
    fetchExperiences();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  if (experiences.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="flex justify-between items-center mb-8">
        <div className="text-left">
          <h2 className="text-3xl font-bold tracking-tight">Top Experiences Near You</h2>
          <p className="mt-2 text-lg text-muted-foreground">
            Highly rated activities and local tours.
          </p>
        </div>
        <Button variant="ghost" asChild className="hidden md:flex">
          <Link href="/experiences">
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
          {experiences.map((exp) => (
            <CarouselItem key={exp.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
              <div className="p-1 h-full">
                <ExperienceCard experience={exp} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
      <div className="text-center mt-8 md:hidden">
        <Button variant="outline" asChild>
          <Link href="/experiences">
            View All Experiences
          </Link>
        </Button>
      </div>
    </section>
  );
}
