
"use server";

import { guidedTripFinder, GuidedTripFinderOutput } from "@/ai/flows/personalized-trip-recommendations";
import { z } from "zod";
import type { Trip, User } from "@/lib/types";

const formSchema = z.object({
  preferences: z.string().min(3, { message: "Please enter at least 3 characters." }),
});

// Define the new state shape for the useActionState hook.
export type AIPlannerState = {
  summary: string;
  trips: Omit<Trip, 'organizer' | 'itinerary' | 'inclusions' | 'exclusions'>[]; // Send a lighter Trip object to the client
  error: string | null;
};

const initialState: AIPlannerState = {
  summary: "",
  trips: [],
  error: null,
};

export async function getAIRecommendations(
  prevState: AIPlannerState,
  formData: FormData
): Promise<AIPlannerState> {

  try {
    const parsed = formSchema.safeParse({
      preferences: formData.get('preferences'),
    });

    if (!parsed.success) {
      return {
        ...initialState,
        error: parsed.error.errors.map((e) => e.message).join(', '),
      };
    }

    const result: GuidedTripFinderOutput = await guidedTripFinder({
      preferences: parsed.data.preferences,
    });
    
    return {
      summary: result.summary,
      trips: result.recommendedTrips,
      error: null,
    };

  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    return {
      ...initialState,
      error: `An unexpected error occurred. Please try again. Details: ${errorMessage}`,
    };
  }
}
