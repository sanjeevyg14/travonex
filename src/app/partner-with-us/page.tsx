
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Mountain, Activity, Users, Zap, CreditCard } from "lucide-react";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Partner with Travonex | List Your Trips & Experiences',
  description: 'Grow your travel business with Travonex. Reach thousands of travelers by listing your multi-day trips, treks, or local experiences on our platform.',
};

const whyPartnerFeatures = [
    {
        icon: <Users className="h-8 w-8 text-primary"/>,
        title: "Reach More Travelers",
        description: "Tap into a large community of adventure-seekers actively looking for unique experiences."
    },
    {
        icon: <Zap className="h-8 w-8 text-primary"/>,
        title: "Simplified Technology",
        description: "Manage bookings, schedules, and communication effortlessly with our intuitive dashboard."
    },
    {
        icon: <CreditCard className="h-8 w-8 text-primary"/>,
        title: "Secure & Timely Payouts",
        description: "Get reliable, automated weekly payouts directly to your bank account for all completed trips."
    }
];

export default function PartnerLandingPage() {
  return (
    <div className="bg-muted/40 py-12 md:py-20">
      <div className="container max-w-5xl mx-auto">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Partner with Travonex</h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Join our curated network of local experts and share your passion with the world.
          </p>
        </div>
        
        <div className="my-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {whyPartnerFeatures.map(feature => (
                    <div key={feature.title} className="text-center flex flex-col items-center">
                        <div className="bg-primary/10 text-primary p-4 rounded-full mb-4">
                             {feature.icon}
                        </div>
                        <h3 className="text-xl font-semibold">{feature.title}</h3>
                        <p className="text-muted-foreground mt-2">{feature.description}</p>
                    </div>
                ))}
            </div>
        </div>

        <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold">Choose Your Partnership Type</h2>
            <p className="text-lg text-muted-foreground">Select the option that best fits your business.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 text-primary p-3 rounded-full">
                  <Mountain className="h-8 w-8" />
                </div>
                <CardTitle className="text-2xl">Multi-Day Trips</CardTitle>
              </div>
              <CardDescription className="pt-4">
                For organizers of treks, road trips, weekend getaways, camping, and other curated itineraries that span one or more days.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-1 shrink-0 text-primary" />
                  <span>Manage complex itineraries and multiple batches.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-1 shrink-0 text-primary" />
                  <span>Offer group discounts and custom pricing.</span>
                </li>
                 <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-1 shrink-0 text-primary" />
                  <span>Full-feature dashboard for bookings and payouts.</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full" size="lg">
                <Link href="/dashboard/organizer-application">List Your Trip</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
                <div className="flex items-center gap-4">
                    <div className="bg-primary/10 text-primary p-3 rounded-full">
                    <Activity className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-2xl">Local Experiences</CardTitle>
                </div>
              <CardDescription className="pt-4">
                For vendors of hourly or single-day activities like city tours, workshops, adventure sports, water sports, and local classes.
              </CardDescription>
            </CardHeader>
             <CardContent className="flex-grow">
                <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 mt-1 shrink-0 text-primary" />
                    <span>Manage hourly time slots and daily capacity.</span>
                    </li>
                    <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 mt-1 shrink-0 text-primary" />
                    <span>Get bookings instantly with real-time availability.</span>
                    </li>
                    <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 mt-1 shrink-0 text-primary" />
                    <span>Simplified listing process for quick onboarding.</span>
                    </li>
              </ul>
            </CardContent>
            <CardFooter>
               <Button asChild className="w-full" size="lg">
                <Link href="/dashboard/experience-vendor-application">List Your Experience</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
