/**
 * @file This component renders the main "Hero" section for the homepage.
 * It's the large, visually engaging area at the top of the page.
 *
 * --- How It Works ---
 * 1.  **Visuals**: It displays a large background image with a semi-transparent overlay to ensure text is readable. The image has a subtle "Ken Burns" zooming animation (`animate-kenburns-top-right`) for a dynamic feel.
 * 2.  **Search Functionality**:
 *     - It contains a search form with a single text input.
 *     - When the form is submitted, it captures the search term using `useState`.
 *     - It then programmatically navigates the user to the `/discover` page, passing the search term as a URL query parameter (e.g., `/discover?search=himalayas`).
 * 3.  **Call-to-Action (CTA) Buttons**: It includes prominent buttons that link directly to the main "Discover Trips" and "Discover Experiences" pages, providing clear entry points for users.
 */

"use client";

import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight, Compass, Activity } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import Link from "next/link";

// Static data for the hero section content.
const heroItem = {
  id: "hero2", // Updated to a more dynamic image
  title: "Plan Less. Travel More.",
  description: "Discover and book unique trips curated by verified local experts.",
  link: "/discover",
};

export function Hero() {
  const placeholder = PlaceHolderImages.find((p) => p.id === heroItem.id);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  // Handles the form submission for the search input.
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    router.push(`/discover?${params.toString()}`);
  };

  return (
    <section className="relative w-full h-[calc(100vh-4rem)] overflow-hidden">
      {/* Background Image with Ken Burns effect */}
      {placeholder && (
        <Image
          src={placeholder.imageUrl}
          alt={placeholder.description}
          fill
          className="object-cover animate-kenburns-top-right"
          priority
          data-ai-hint={placeholder.imageHint}
        />
      )}
      {/* Darkening overlay for text readability */}
      <div className="absolute inset-0 bg-black/50" />
      {/* Subtle gradient for visual depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent" />
      
      {/* Centered content */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl bg-background/20 text-white backdrop-blur-sm border-white/30 p-6 md:p-8 text-center space-y-6 animate-in fade-in-0 zoom-in-95 duration-500">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
              {heroItem.title}
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-xl mx-auto">
              {heroItem.description}
            </p>
          </div>
          
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for treks, experiences, destinations, or weekend getaways"
                aria-label="Search for trips and experiences"
                className="w-full text-foreground pl-10 h-12 bg-card/90 border-white/50 focus:ring-2 focus:ring-primary rounded-lg text-base placeholder:text-muted-foreground transition-shadow focus:shadow-lg focus:shadow-primary/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button type="submit" size="lg" className="h-12 w-full md:w-auto hover:scale-105 transition-transform hover:shadow-lg hover:shadow-primary/30">
              <Search className="md:hidden"/>
              <span className="hidden md:inline">Search</span>
            </Button>
          </form>
          
           <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <Button asChild variant="secondary" size="lg" className="transition-transform hover:scale-105 whitespace-nowrap">
                <Link href="/discover">
                    <Compass className="mr-2 h-5 w-5"/>
                    Browse Trips
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
               <Button asChild variant="secondary" size="lg" className="transition-transform hover:scale-105 whitespace-nowrap">
                 <Link href="/experiences">
                    <Activity className="mr-2 h-5 w-5"/>
                    Browse Experiences
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
          </div>
        </Card>
      </div>
    </section>
  );
}