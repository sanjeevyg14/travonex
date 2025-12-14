
import { AIPlannerForm } from "@/components/ai-planner-form";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Bot, PencilLine, Search } from "lucide-react";
import Image from "next/image";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Planner',
  description: 'Describe your perfect trip, and let our AI Planner search our curated catalog to find the best adventures for you.',
};


const howItWorksSteps = [
    {
        icon: <PencilLine className="h-8 w-8" />,
        title: "1. Describe Your Trip",
        description: "Tell our AI about your ideal journey—your interests, budget, and travel style. Be as detailed as you like!"
    },
    {
        icon: <Bot className="h-8 w-8" />,
        title: "2. Our AI Analyzes",
        description: "Our AI instantly analyzes your request and filters our curated catalog to find the perfect options for you."
    },
    {
        icon: <Search className="h-8 w-8" />,
        title: "3. Get Your Matches",
        description: "Receive personalized recommendations complete with summaries and direct links to book your next adventure."
    }
];

export default function AIPlannerPage() {
    const heroImage = PlaceHolderImages.find(p => p.id === 'hero2');
  return (
     <div className="flex flex-col min-h-[calc(100vh-4rem)]">
        <section className="relative flex-grow flex items-center justify-center py-12 md:py-20">
            {heroImage && (
                <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="object-cover"
                data-ai-hint={heroImage.imageHint}
                />
            )}
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative z-10 w-full px-4">
                 <AIPlannerForm />
            </div>
        </section>

        <section className="py-12 md:py-20 bg-muted/50 text-center">
            <div className="container">
                <h2 className="text-3xl font-bold tracking-tight">How It Works</h2>
                <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
                    A simple three-step process to your next curated adventure.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 max-w-5xl mx-auto">
                    {howItWorksSteps.map((step) => (
                        <div key={step.title} className="flex flex-col items-center gap-4">
                            <div className="bg-primary/10 text-primary p-4 rounded-full">
                                {step.icon}
                            </div>
                            <h3 className="text-xl font-semibold">{step.title}</h3>
                            <p className="text-muted-foreground">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    </div>
  );
}
