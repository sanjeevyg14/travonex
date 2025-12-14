/**
 * @file This is the main entry point for the trip discovery page (`/discover`).
 *
 * --- How It Works ---
 * 1.  **Server Component**: This is a Next.js Server Component. It renders the static parts of the page, such as the title and description.
 * 2.  **Suspense Boundary**: It wraps the main interactive component, `DiscoverFilters`, in a `<Suspense>` boundary. This is a key performance optimization. It allows the server to send the static parts of the page to the browser immediately, while the `DiscoverFilters` component (which is a Client Component that needs to fetch data and handle state) loads in parallel.
 * 3.  **Client Component**: The `DiscoverFilters` component contains all the interactive logic for searching, filtering, and displaying the list of trips.
 */
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { DiscoverFilters } from '@/components/discover/discover-filters';

// SEO metadata for the Discover page.
export const metadata: Metadata = {
  title: 'Discover Trips',
  description: 'Explore our full catalog of curated treks, road trips, camping experiences, and weekend getaways. Filter by destination or category to find your perfect adventure.',
};

export default function DiscoverPage() {
  return (
    <div className="container py-8">
      <div className="space-y-4 text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Discover Your Next Adventure</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Search for destinations, categories, or keywords. Filter by your preferences to find the perfect trip.
        </p>
      </div>
      {/* 
        Using Suspense allows the static part of the page to render first, 
        showing a fallback UI while the interactive filter component loads.
      */}
      <Suspense fallback={<div>Loading filters...</div>}>
        <DiscoverFilters />
      </Suspense>
    </div>
  );
}
