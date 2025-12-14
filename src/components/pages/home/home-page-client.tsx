/**
 * @file This is the main client-side component for the homepage.
 * It assembles all the different sections of the homepage into a cohesive layout.
 *
 * --- How It Works ---
 * 1.  **Component Assembly**: It imports and renders various child components, each representing a section of the homepage (e.g., `Hero`, `TripCategories`, `TrendingTrips`).
 * 2.  **Layout Control**: It uses a `div` with `flex-col` and `gap` to create the vertical spacing and layout between the different homepage sections.
 * 3.  **No Data Fetching**: This component is purely presentational. All data is fetched by the child components from the `useMockData` context, keeping this layout component clean and focused.
 */

"use client";

import { Hero } from "@/components/pages/home/hero";
import { TravelerStories } from "@/components/pages/home/traveler-stories";
import { TripCategories } from "@/components/pages/home/trip-categories";
import { WhyBookBanner } from "@/components/pages/home/why-book-banner";
import { QuickFilters } from "./quick-filters";
import { TrendingTrips } from "./trending-trips";
import { TopExperiences } from "./top-experiences";

/**
 * The main client component that renders the homepage layout by composing various sections.
 */
export default function HomePageClient() {
  return (
    <div className="flex flex-col w-full overflow-x-hidden">
      <Hero />
      {/* 
        This div creates the main content flow of the homepage, with consistent vertical spacing
        between each section. This makes it easy to reorder or add new sections.
      */}
      <div className="flex flex-col gap-12 md:gap-20 py-12 md:py-20 z-10">
        <div className="container">
            <TripCategories />
        </div>
         <div className="container">
            <QuickFilters />
        </div>
        <div className="container">
          <TrendingTrips />
        </div>
        <div className="container">
          <TopExperiences />
        </div>
        <WhyBookBanner />
         <div className="container">
          <TravelerStories />
        </div>
      </div>
    </div>
  );
}
