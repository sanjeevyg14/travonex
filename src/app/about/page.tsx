
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { CheckCircle, ArrowRight, ShieldCheck, Users, Banknote, Star } from "lucide-react";
import type { Metadata } from 'next';
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: 'About Travonex | Our Story & Mission',
  description: 'Travonex connects travelers with verified local experts for safe, authentic trips and experiences across India. Learn who we are and what drives our mission.',
  openGraph: {
      title: 'The Story Behind Travonex',
      description: 'Discover how Travonex helps travelers find trusted organizers, safe adventures, and real experiences across India. Learn our vision and what sets us apart.',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1595495745827-85bcc5c9a028?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxtb3VudGFpbiUyMHN1bnJpc2V8ZW58MHx8fHwxNzYzNTk0MzE1fDA&ixlib=rb-4.1.0&q=80&w=1200',
          width: 1200,
          height: 630,
          alt: 'A trekker overlooking mountains at sunrise, representing Travonex adventures.',
        },
      ],
      type: 'website',
  }
};

const differentiators = [
    { 
        icon: <Users className="h-8 w-8 text-primary" />,
        title: "Verified Local Experts",
        description: "Every organizer on Travonex goes through a strict verification process. Only trustworthy and experienced experts are allowed to host trips and activities."
    },
    {
        icon: <ShieldCheck className="h-8 w-8 text-primary" />,
        title: "Safety First",
        description: "We review safety practices, experience levels, and the quality of equipment before approving any organizer. Your wellbeing always comes first."
    },
    {
        icon: <Banknote className="h-8 w-8 text-primary" />,
        title: "Transparent Pricing",
        description: "No surprises. You see the complete price upfront. Every fee is clear before you make a booking."
    },
    {
        icon: <Star className="h-8 w-8 text-primary" />,
        title: "Genuine Traveler Reviews",
        description: "We show honest feedback from real customers. You get a clear picture of what to expect."
    }
];

const howItWorksSteps = [
    "Discover the trip or activity you want",
    "Compare details, reviews, and pricing",
    "Book securely in a few taps",
    "Enjoy your adventure"
];

export default function AboutPage() {
    const heroImage = PlaceHolderImages.find(p => p.id === 'hero1');

    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative h-64 md:h-80 w-full">
                {heroImage && (
                    <Image
                        src={heroImage.imageUrl}
                        alt="Inspiring mountain landscape representing adventure travel in India"
                        fill
                        className="object-cover"
                        data-ai-hint="mountain landscape"
                        priority
                    />
                )}
                <div className="absolute inset-0 bg-black/60" />
                <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white p-4">
                    <h1 className="text-4xl md:text-5xl font-bold">The Story Behind Travonex</h1>
                    <p className="mt-4 text-lg md:text-xl max-w-2xl text-white/90">
                        Every great journey starts with an idea. Ours began with a belief that adventure should feel real, safe, and effortless for every traveler.
                    </p>
                </div>
            </section>

            {/* Main Content */}
            <div className="container py-12 md:py-20 max-w-4xl mx-auto space-y-16">
                
                {/* Why Travonex Exists */}
                <section>
                    <h2 className="text-3xl font-bold text-center mb-6">Why Travonex Exists</h2>
                    <div className="text-lg text-muted-foreground text-center space-y-4 max-w-3xl mx-auto">
                        <p>
                            Travonex was created after seeing how difficult it is for people to find genuine, well-organized, and trustworthy travel experiences. The most memorable adventures often come from passionate local experts who understand the terrain, the culture, and what travelers actually need.
                        </p>
                        <p>
                            We wanted to build a space where travelers can easily discover these experts and book trips that feel authentic instead of generic. Our focus has always been on clarity, quality, and trust. No confusing packages. No unexpected costs. Just meaningful adventures.
                        </p>
                    </div>
                </section>
                
                {/* Our Mission */}
                 <section className="bg-muted p-8 rounded-lg">
                    <h2 className="text-3xl font-bold text-center mb-4">Our Mission</h2>
                    <p className="text-lg text-muted-foreground text-center max-w-3xl mx-auto">
                        Our mission is simple. We want to make adventure travel smooth, safe, and accessible for everyone. We work with local experts who bring real knowledge and genuine passion for the places they explore. We want every traveler to experience India in a way that feels personal and unforgettable.
                    </p>
                </section>

                {/* What Makes Travonex Different */}
                <section>
                    <h2 className="text-3xl font-bold text-center mb-8">What Makes Travonex Different</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {differentiators.map(feature => (
                            <Card key={feature.title} className="bg-card">
                                <CardHeader className="flex flex-row items-center gap-4">
                                    {feature.icon}
                                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">{feature.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                 {/* How We Select Organizers */}
                <section>
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div>
                            <h2 className="text-3xl font-bold mb-4">How We Select Organizers</h2>
                            <p className="text-muted-foreground mb-6">
                                A simple five-step process helps us keep standards high. Only organizers who meet all criteria are approved.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "Professional background and credibility",
                                    "Strong safety practices",
                                    "Local knowledge and experience",
                                    "Service quality",
                                    "Consistent positive reviews"
                                ].map(item => (
                                    <li key={item} className="flex items-start gap-3">
                                        <CheckCircle className="h-5 w-5 text-primary mt-1 shrink-0" />
                                        <span className="font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="relative h-64 md:h-80 w-full rounded-lg overflow-hidden">
                           <Image
                                src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=1974&auto=format&fit=crop"
                                alt="A team of verified travel organizers collaborating on a trip plan"
                                fill
                                className="object-cover"
                                data-ai-hint="team collaboration"
                                loading="lazy"
                            />
                        </div>
                    </div>
                </section>
                
                 {/* How Travonex Works */}
                <section className="bg-muted p-8 rounded-lg text-center">
                     <h2 className="text-3xl font-bold mb-6">How Travonex Works</h2>
                     <p className="text-muted-foreground max-w-2xl mx-auto mb-8">Travonex connects you with local experts and makes the booking process simple. Everything is designed to save your time and give you confidence from start to finish.</p>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {howItWorksSteps.map((step, index) => (
                             <Card key={step} className="bg-background">
                                <CardContent className="p-6">
                                    <p className="text-primary font-bold text-3xl mb-2">{index + 1}</p>
                                    <p className="font-semibold">{step}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                <section>
                    <h2 className="text-3xl font-bold text-center mb-6">Community Stories</h2>
                    <p className="text-lg text-muted-foreground text-center space-y-4 max-w-3xl mx-auto">
                        Travelers across India have used Travonex to discover treks, water sports, weekend trips, and unique activities. Their stories and feedback help us improve the platform and support more local experts.
                    </p>
                </section>


                {/* Call to Action */}
                <section className="text-center">
                    <h2 className="text-3xl font-bold">Start Exploring</h2>
                    <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
                        Begin your next adventure with Travonex and discover trips that feel real, safe, and unforgettable.
                    </p>
                    <Button asChild size="lg" className="mt-6">
                        <Link href="/discover">
                            Browse All Trips <ArrowRight className="ml-2" />
                        </Link>
                    </Button>
                </section>
            </div>
             {/* SEO Footer */}
            <div className="container pb-8">
                <p className="text-xs text-muted-foreground/50 text-center">
                    Travonex is a trusted platform for group trips, weekend getaways, and curated adventure experiences across India. We partner with verified local organizers who follow strong safety practices and bring real knowledge of their destinations. Travelers use Travonex to discover treks, water sports, road trips, and unique outdoor activities with clear prices and genuine reviews.
                </p>
            </div>
        </div>
    );
}

