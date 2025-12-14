/**
 * @file This component renders a horizontally scrollable list of "Interest Filters" on the homepage.
 *
 * --- How It Works ---
 * 1.  **Static Data**: It uses a predefined array (`interestFilters`) that contains the label, icon, and target URL for each filter button.
 * 2.  **Navigation**: When a user clicks a filter button, the `handleFilterClick` function is triggered.
 * 3.  **Analytics**: Before navigating, it calls a `trackEvent` function to log the user's interaction. This is a placeholder for a real analytics integration (like Google Tag Manager), allowing for tracking of user engagement with these filters.
 * 4.  **Routing**: It uses Next.js's `useRouter` hook to programmatically navigate the user to the specified URL (e.g., `/discover?category=Treks`).
 * 5.  **Scrolling**: The `ScrollArea` component from `shadcn/ui` is used to ensure the list is easily scrollable on all devices, especially mobile.
 */

"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Mountain, Car, Tent, Droplets, Wind, Trees, Wallet } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

// A static array defining the quick filter options.
const interestFilters = [
  { label: "Water Sports", icon: <Droplets />, href: "/experiences?category=Water" },
  { label: "Adventure", icon: <Wind />, href: "/experiences?category=Adventure" },
  { label: "Nature", icon: <Trees />, href: "/experiences?category=Nature" },
  { label: "Treks", icon: <Mountain />, href: "/discover?category=Treks" },
  { label: "Road Trips", icon: <Car />, href: "/discover?category=Road+Trips" },
  { label: "Camping", icon: <Tent />, href: "/discover?category=Camping" },
  { label: "Budget-Friendly", icon: <Wallet />, href: "/discover" },
];

/**
 * A mock analytics tracking function. In a real application, this would push
 * data to a service like Google Tag Manager.
 */
const trackEvent = (eventName: string, payload: Record<string, any>) => {
    console.log(`Analytics Event Fired: ${eventName}`, payload);
    if (typeof window.dataLayer !== 'undefined') {
        window.dataLayer.push({
            event: eventName,
            ...payload
        });
    }
};


export function QuickFilters() {
  const router = useRouter();

  const handleFilterClick = (href: string, filterName: string) => {
    // Fire an analytics event before navigating.
    trackEvent('interest_filter_click', {
        filter: filterName.toLowerCase(),
        origin: 'homepage',
    });
    router.push(href);
  };

  return (
    <section>
        <div className="text-left md:text-center">
            <h3 className="text-2xl font-bold tracking-tight">Explore by Interest</h3>
        </div>
        <ScrollArea className="w-full whitespace-nowrap mt-6">
            <div className="flex w-max space-x-2 pb-4">
                {interestFilters.map((filter) => (
                <Button
                    key={filter.label}
                    variant="outline"
                    className="h-auto px-4 py-2"
                    onClick={() => handleFilterClick(filter.href, filter.label)}
                >
                    <div className="flex items-center gap-2">
                        {filter.icon}
                        <span className="font-medium">{filter.label}</span>
                    </div>
                </Button>
                ))}
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    </section>
  );
}