

"use client";

import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function BrandStory() {
    const storyImage = PlaceHolderImages.find(p => p.id === 'blog1');

    return (
        <Card className="overflow-hidden h-full relative">
             {storyImage && (
                <Image
                    src={storyImage.imageUrl}
                    alt="An explorer looking over a mountain valley"
                    fill
                    className="object-cover"
                    data-ai-hint="explorer mountain"
                />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="relative flex flex-col justify-end h-full p-8 text-white">
                <CardHeader className="p-0">
                    <CardTitle className="text-3xl font-bold tracking-tight">Our Story</CardTitle>
                </CardHeader>
                <CardContent className="p-0 mt-4">
                    <p className="text-lg text-white/90">
                        Travonex was created with a simple idea: authentic adventures come from passionate local experts — the people who live, breathe, and explore these destinations every day. We’re building a platform that connects these experts with travelers who crave real experiences.
                    </p>
                </CardContent>
                <CardFooter className="p-0 mt-6">
                    <Button asChild variant="secondary">
                        <Link href="/about">
                            Learn More About Us
                            <ArrowRight className="ml-2"/>
                        </Link>
                    </Button>
                </CardFooter>
            </div>
        </Card>
    );
}
