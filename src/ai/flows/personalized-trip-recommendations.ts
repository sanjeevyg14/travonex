
'use server';
/**
 * @fileOverview A guided trip search engine that provides recommendations based on keywords, price, and duration from user input.
 */

import { z } from 'zod';
import { initialTrips } from '@/lib/data';
import type { Trip } from '@/lib/types';

// --- INPUT and OUTPUT Schemas ---
const GuidedTripFinderInputSchema = z.object({
  preferences: z.string(),
});
export type GuidedTripFinderInput = z.infer<typeof GuidedTripFinderInputSchema>;

const GuidedTripFinderOutputSchema = z.object({
  summary: z.string(),
  recommendedTrips: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      slug: z.string(),
      category: z.string(),
      location: z.string(),
      price: z.number(),
      shortDescription: z.string(),
      image: z.string(),
    })
  ),
});
export type GuidedTripFinderOutput = z.infer<typeof GuidedTripFinderOutputSchema>;

// --- Helper function to parse numbers from text ---
const parsePrice = (text: string): number | null => {
  const priceRegex = /(?:under|below|around|less than|max|budget of)[\s₹]*([\d,]+)|([\d,]+)k|₹\s*([\d,]+)/i;
  const match = text.match(priceRegex);
  if (!match) return null;
  
  const priceStr = match[1] || match[2] || match[3];
  let price = parseFloat(priceStr.replace(/,/g, ''));
  if (match[2]) { // If the format is "10k"
      price *= 1000;
  }
  return price;
};

// --- Main exported function that the server action will call. ---
export async function guidedTripFinder(
  input: GuidedTripFinderInput
): Promise<GuidedTripFinderOutput> {
  const { preferences } = input;
  const lowerPreferences = preferences.toLowerCase();

  // Extract criteria from the user's text
  const maxPrice = parsePrice(lowerPreferences);
  const keywords = lowerPreferences.split(' ').filter(word => word.length > 2 && !['under', 'below', 'around', 'price', 'budget', 'for', 'a', 'in', 'of'].includes(word));

  // --- BACKEND INTEGRATION POINT ---
  // The following filtering logic operates on a mock data array (`initialTrips`).
  // A backend developer must replace this with a real database query.
  // The API endpoint should accept `maxPrice` and `keywords` as parameters
  // and return trip data that matches the `recommendedTrips` schema.
  // See `docs/backend-integration-guide.md` for more details.
  const filteredTrips = initialTrips
    .filter(trip => trip.status === 'published')
    .filter(trip => {
      let score = 0;
      const tripText = `${trip.title} ${trip.category} ${trip.location} ${trip.shortDescription}`.toLowerCase();

      // Price filter
      if (maxPrice && trip.price > maxPrice) {
        return false;
      }
      
      // Keyword filter
      for (const keyword of keywords) {
        if (tripText.includes(keyword)) {
          score++;
        }
      }

      return score > 0;
    });

  const recommendedTrips = filteredTrips.slice(0, 6).map(trip => ({
    id: trip.id,
    title: trip.title,
    slug: trip.slug,
    category: trip.category,
    location: trip.location,
    price: trip.price,
    shortDescription: trip.shortDescription,
    image: trip.image,
  }));

  return {
    summary: "Based on your preferences, here are some trips you might like.",
    recommendedTrips,
  };
}
