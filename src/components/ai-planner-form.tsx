
"use client";

import { useActionState, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "./ui/button";
import { getAIRecommendations, AIPlannerState } from '@/app/ai-planner/actions';
import { Loader2, Bot } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { TripCard } from './trip-card';
import { useAuth } from '@/hooks/use-auth';

const initialState: AIPlannerState = {
  summary: "",
  trips: [],
  error: null,
};

const examplePrompts = [
  "A solo bike trip through Spiti Valley on a budget under 15000.",
  "A relaxing family weekend getaway near Mumbai.",
  "I want to go on a challenging trek in Uttarakhand.",
  "Show me romantic honeymoon packages in Kerala for 7 days."
];

export function AIPlannerForm() {
  const [state, formAction, isPending] = useActionState(getAIRecommendations, initialState);
  const [preferences, setPreferences] = useState("");
  const { user } = useAuth();
  
  const isProUser = user?.subscriptionTier === 'pro';

  const handleFormSubmit = (formData: FormData) => {
    formData.set('preferences', preferences);
    formAction(formData);
  };

  return (
    <Card className="max-w-3xl mx-auto shadow-xl">
      <form action={handleFormSubmit}>
        <CardHeader className="p-6">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Bot className="text-primary" />
            AI Planner
          </CardTitle>
          <CardDescription>
             Describe your ideal trip, and our AI will find the best matches for you. Pro members get access to an advanced AI model for even better recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-6">
          <div className="space-y-2">
            <Label htmlFor="preferences" className="text-base font-semibold">What are you looking for?</Label>
            <Textarea
              id="preferences"
              name="preferences"
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              placeholder="e.g., 'I want a quiet mountain escape with great hiking, local food, and a budget under ₹10,000. I prefer trips under 4 days.'"
              rows={5}
              required
            />
          </div>
           <div className="space-y-3">
              <Label className="text-sm text-muted-foreground">Or try one of these ideas:</Label>
              <div className="flex flex-wrap gap-2">
                {examplePrompts.map(prompt => (
                  <Button 
                    key={prompt}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPreferences(prompt)}
                    className="text-muted-foreground h-auto whitespace-normal text-left"
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-4 p-6">
          <Button type="submit" disabled={isPending} size="lg">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Asking AI...
              </>
            ) : (
              'Generate Recommendations'
            )}
          </Button>
        </CardFooter>
      </form>

      {/* --- Display Results --- */}
      {(state.error || isPending || state.trips.length > 0) && (
        <div className="p-6 pt-0 space-y-6">
            {state.error && (
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{state.error}</AlertDescription>
            </Alert>
            )}

            {isPending && !state.summary && !state.error && (
            <div className="text-center p-8 space-y-3">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Our AI is planning your trip...</p>
            </div>
            )}

            {state.summary && !state.error && (
            <Alert>
                <AlertTitle className="flex items-center gap-2"><Bot className="h-4 w-4" /> AI Recommendations</AlertTitle>
                <AlertDescription>
                    {state.summary}
                </AlertDescription>
            </Alert>
            )}
            
            {state.trips.length > 0 && !state.error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {state.trips.map((trip) => (
                <TripCard key={trip.id} trip={trip as any} />
                ))}
            </div>
            )}
        </div>
      )}
    </Card>
  );
}
