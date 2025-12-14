'use server';
/**
 * @fileoverview This file defines the tools that the Genkit AI agent can use
 * to interact with the application's data, specifically for searching trips.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { initialTrips } from '@/lib/data';
import type { Trip } from '@/lib/types';

// Define the input schema for the search tool.
// The AI will use this to structure its search queries.
const SearchTripsInputSchema = z.object({
  query: z.string().describe('A search query to filter trips by title, location, or category.'),
});

// Define the output schema for the search tool.
// This ensures the AI knows what kind of data to expect in return.
const SearchTripsOutputSchema = z.array(
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
);

// Create the Genkit tool.
export const searchTrips = ai.defineTool(
  {
    name: 'searchTrips',
    description: 'Search for available trips based on a query. Returns a list of trips that can be presented to the user.',
    input: { schema: SearchTripsInputSchema },
    output: { schema: SearchTripsOutputSchema },
  },
  async (input) => {
    console.log(`[AI Tool] Searching trips with query: ${input.query}`);
    
    const searchLower = input.query.toLowerCase();
    
    // In a real app, this would be a database query.
    // For the prototype, we filter the in-memory array.
    const results = initialTrips
      .filter(trip => 
        trip.status === 'published' && (
          trip.title.toLowerCase().includes(searchLower) ||
          trip.location.toLowerCase().includes(searchLower) ||
          trip.category.toLowerCase().includes(searchLower) ||
          trip.shortDescription.toLowerCase().includes(searchLower)
        )
      )
      .map(trip => ({ // Return a subset of fields to keep the payload small
        id: trip.id,
        title: trip.title,
        slug: trip.slug,
        category: trip.category,
        location: trip.location,
        price: trip.price,
        shortDescription: trip.shortDescription,
        image: trip.image,
      }));

    return results.slice(0, 5); // Return a max of 5 results to the AI
  }
);
