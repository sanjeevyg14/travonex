
import { ShieldCheck, Users, Banknote, LifeBuoy, Star, BookLock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrandStory } from "./brand-story";

const features = [
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: "Verified Local Experts",
    description: "Every trip and experience on Travonex is hosted by trusted, skilled organizers who know the terrain, culture, and safety standards inside out. Each partner passes a strict verification check before going live."
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-primary" />,
    title: "Unmatched Safety Standards",
    description: "Your adventures are protected with best-in-class safety checks, reliable operators, and transparent guidelines. Every partner follows strict safety protocols."
  },
  {
    icon: <Banknote className="h-8 w-8 text-primary" />,
    title: "Transparent Pricing",
    description: "No hidden charges. No surprise fees. Travonex shows clear, upfront pricing so you always know exactly what you're paying for before you hit ‘Book Now’."
  },
  {
    icon: <LifeBuoy className="h-8 w-8 text-primary" />,
    title: "Dedicated Trip Support",
    description: "From the moment you’re browsing till the moment you return, our team is here to help with itinerary questions, bookings, rescheduling, or last-minute changes."
  },
  {
    icon: <Star className="h-8 w-8 text-primary" />,
    title: "Authentic Reviews You Can Trust",
    description: "All reviews come from real travelers who completed the trip or experience. No fake ratings or manipulated scores — just honest feedback to help you choose confidently."
  },
  {
    icon: <BookLock className="h-8 w-8 text-primary" />,
    title: "Seamless, Secure Bookings",
    description: "All payments are encrypted and secure. Travonex also offers flexible booking options, instant confirmations, and reliable vendor coordination for a smooth travel experience."
  }
];

export function WhyBookBanner() {
  return (
    <section className="bg-muted/40 py-12 md:py-20">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight">Your Adventure, Our Promise</h2>
          <p className="mt-2 text-lg text-muted-foreground max-w-3xl mx-auto">Here’s why travelers choose Travonex for their next escape.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {features.map((feature) => (
                <Card key={feature.title} className="text-center bg-background/50 shadow-sm hover:shadow-lg transition-shadow" role="region" aria-labelledby={`feature-title-${feature.title.replace(/\s/g, '-')}`}>
                  <CardHeader className="items-center">
                    {feature.icon}
                  </CardHeader>
                  <CardContent>
                    <CardTitle id={`feature-title-${feature.title.replace(/\s/g, '-')}`} className="text-lg mb-2">{feature.title}</CardTitle>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="h-full">
                <BrandStory />
            </div>
        </div>
      </div>
    </section>
  );
}
