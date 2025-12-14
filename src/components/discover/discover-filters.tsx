/**
 * @file This component is the interactive core of the Discover page.
 * It handles all client-side logic for searching, filtering, and displaying trips.
 *
 * --- How It Works ---
 * 1.  **State Management**: It uses `useState` to manage the state of all filters: search term, category, and departure city.
 * 2.  **URL Syncing**: It initializes its state from the URL's search parameters (`useSearchParams`), allowing users to share links to filtered views.
 * 3.  **Live Filtering**: It uses `useMemo` to efficiently re-filter the list of trips whenever any filter state changes. This is highly performant as it avoids re-calculating the list on every render.
 * 4.  **Responsive UI**:
 *     - On desktop, it displays all filters in a persistent bar.
 *     - On mobile, it collapses the filters into a `Sheet` component (a slide-out panel) to save space, providing a clean and accessible interface.
 * 5.  **Empty State**: If no trips match the current filters, it displays a helpful message and a "Clear Filters" button, preventing a dead-end experience.
 */

"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { TripCard } from "@/components/trip-card";
import { useMockData } from "@/hooks/use-mock-data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, SlidersHorizontal } from "lucide-react";
import type { Trip } from "@/lib/types";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";

export function DiscoverFilters() {
  const { trips, travelCities, tripCategories } = useMockData();
  const searchParams = useSearchParams();
  
  // Initialize filter state from URL parameters or defaults.
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || "");
  const [category, setCategory] = useState(searchParams.get('category') || "all");
  const [departureCity, setDepartureCity] = useState(searchParams.get('departureCity') || "all");
  const [isSearching, setIsSearching] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  // Memoize the list of published trips to avoid re-filtering on every render.
  const publishedTrips = useMemo(() => trips.filter(trip => trip.status === 'published'), [trips]);

  // Memoize the filtered results. This calculation only re-runs when a filter changes.
  const filteredTrips = useMemo(() => {
    return publishedTrips.filter((trip) => {
      const matchesSearch =
        !searchTerm ||
        trip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = category === "all" || trip.category === category;
      const matchesCity = departureCity === "all" || trip.departureCity === departureCity;
      return matchesSearch && matchesCategory && matchesCity;
    });
  }, [searchTerm, category, departureCity, publishedTrips]);

  // Simulate a search action and close the mobile filter sheet.
  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 300);
    setIsSheetOpen(false);
  }

  // Reset all filters to their default state.
  const handleReset = () => {
    setSearchTerm("");
    setCategory("all");
    setDepartureCity("all");
    setIsSheetOpen(false);
  }
  
  // Reusable JSX for filter dropdowns.
  const filterControls = (
    <>
        <div className="space-y-2">
          <label htmlFor="departure-city" className="text-sm font-medium">Departure City</label>
          <Select value={departureCity} onValueChange={setDepartureCity}>
            <SelectTrigger id="departure-city">
              <SelectValue placeholder="All Cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {travelCities.map(city => (
                <SelectItem key={city} value={city}>{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label htmlFor="trip-type" className="text-sm font-medium">Trip Type</label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="trip-type">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {tripCategories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
    </>
  );

  return (
    <>
    <div className="p-6 mb-12 bg-card/60 rounded-xl shadow-lg border">
          {/* Desktop: Full-width filter bar */}
          <div className="hidden md:grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="md:col-span-2 space-y-1">
                <label htmlFor="search-desktop" className="text-sm font-medium">Search by Destination or Trip</label>
                <Input 
                  id="search-desktop" 
                  placeholder="e.g., Manali, Goa, Camping..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="grid gap-4 md:col-span-2 md:grid-cols-2">
              {filterControls}
            </div>
            <div className="flex gap-2">
              <Button className="w-full h-10" onClick={handleSearch} disabled={isSearching}>
                <Search className="mr-2 h-4 w-4" />
                {isSearching ? "Searching..." : "Search"}
              </Button>
              <Button variant="outline" size="icon" className="h-10 w-10 shrink-0" onClick={handleReset}>
                  <X className="h-4 w-4"/>
                  <span className="sr-only">Reset Filters</span>
              </Button>
            </div>
          </div>

          {/* Mobile: Search bar with a "Show Filters" button that opens a sheet */}
          <div className="md:hidden space-y-4">
             <div className="space-y-1">
                <label htmlFor="search-mobile" className="text-sm font-medium">Search by Destination or Trip</label>
                <Input 
                  id="search-mobile" 
                  placeholder="e.g., Manali, Goa, Camping..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Show Filters
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filter Your Search</SheetTitle>
                </SheetHeader>
                <div className="py-4 grid gap-4">
                  {filterControls}
                </div>
                <SheetFooter className="grid grid-cols-2 gap-2">
                    <Button variant="secondary" onClick={handleReset}>Clear All</Button>
                    <Button onClick={handleSearch}>Apply Filters</Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
      </div>

      {/* Render the grid of results or the empty state message. */}
      {filteredTrips.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTrips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold">No Trips Found</h2>
          <p className="text-muted-foreground mt-2">Try adjusting your search or filters. Your next adventure is just a click away!</p>
          <Button onClick={handleReset} className="mt-4">Clear Filters</Button>
        </div>
      )}
      </>
  );
}