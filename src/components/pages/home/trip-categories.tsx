"use client";

import { Card } from "@/components/ui/card";
import { Briefcase, Car, Mountain, Tent, Activity } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Link from "next/link";
import Image from "next/image";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { useMemo } from "react";

// The feature flag is now permanently ON as per implementation instruction.
const featureFlags = {
  experiences_homecard: true,
};

const allCategories = [
  { id: 'treks', name: "Treks", icon: <Mountain className="h-8 w-8" />, href: "/discover?category=Treks", imageId: "trip1" },
  { id: 'road-trips', name: "Road Trips", icon: <Car className="h-8 w-8" />, href: "/discover?category=Road+Trips", imageId: "trip2" },
  { id: 'experiences', name: "Experiences", icon: <Activity className="h-8 w-8" />, href: "/experiences", imageId: "exp1", flag: 'experiences_homecard' },
  { id: 'camping', name: "Camping", icon: <Tent className="h-8 w-8" />, href: "/discover?category=Camping", imageId: "trip3" },
  { id: 'getaways', name: "Weekend Getaways", icon: <Briefcase className="h-8 w-8" />, href: "/discover?category=Weekend+Getaways", imageId: "trip4" },
];

const trackEvent = (eventName: string, payload: Record<string, any>) => {
    console.log(`Analytics Event: ${eventName}`, payload);
};


export function TripCategories() {

  const categories = useMemo(() => {
    return allCategories.filter(category => {
      if (category.flag) {
        return featureFlags[category.flag as keyof typeof featureFlags];
      }
      return true;
    });
  }, []);

  const handleCategoryClick = (categoryName: string, position: number) => {
    trackEvent('category_click', {
        category: categoryName.toLowerCase(),
        position: position + 1,
    });
    if (categoryName === 'Experiences') {
        trackEvent('experiences_open', {
            origin: 'homepage',
            referrer: '/',
        });
    }
  };

  return (
    <section>
      <div className="text-left md:text-center">
        <h2 className="text-3xl font-bold tracking-tight">Find Your Next Escape</h2>
        <p className="mt-2 text-lg text-muted-foreground">
          Explore trips by what you love to do.
        </p>
      </div>

       {/* Desktop Grid */}
      <div className="mt-8 hidden md:grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
        {categories.map((category, index) => {
          const placeholder = PlaceHolderImages.find((p) => p.id === category.imageId);
          return (
            <Link href={category.href} key={category.name} className="group block" onClick={() => handleCategoryClick(category.name, index)} aria-label={`Open ${category.name}`}>
               <Card className="relative overflow-hidden rounded-lg h-36 md:h-48 flex items-center justify-center transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-105">
                 {placeholder && (
                    <Image
                      src={placeholder.imageUrl}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                      data-ai-hint={placeholder.imageHint}
                    />
                  )}
                 <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors"></div>
                 <div className="relative text-primary-foreground flex flex-col items-center gap-2">
                   {category.icon}
                   <span className="font-semibold text-lg">{category.name}</span>
                 </div>
              </Card>
            </Link>
          )
        })}
      </div>

        {/* Mobile Carousel */}
       <Carousel
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full mt-6 md:hidden"
      >
        <CarouselContent className="-ml-2">
          {categories.map((category, index) => {
              const placeholder = PlaceHolderImages.find((p) => p.id === category.imageId);
              return (
              <CarouselItem key={category.name} className="basis-2/5 pl-2">
                 <Link href={category.href} className="group block h-full" onClick={() => handleCategoryClick(category.name, index)} aria-label={`Open ${category.name}`}>
                  <Card className="relative overflow-hidden rounded-lg h-36 flex items-center justify-center transition-all duration-300 ease-in-out group-hover:shadow-lg">
                    {placeholder && (
                        <Image
                          src={placeholder.imageUrl}
                          alt={category.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          data-ai-hint={placeholder.imageHint}
                        />
                      )}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors"></div>
                    <div className="relative text-primary-foreground flex flex-col items-center gap-2 text-center">
                      {category.icon}
                      <span className="font-semibold text-base">{category.name}</span>
                    </div>
                  </Card>
                </Link>
              </CarouselItem>
          )})}
        </CarouselContent>
      </Carousel>

    </section>
  );
}
