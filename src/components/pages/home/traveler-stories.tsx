
"use client";

import { BlogCard } from "@/components/blog-card";
import { useMockData } from "@/hooks/use-mock-data";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function TravelerStories() {
  const { blogStories } = useMockData();
  const stories = blogStories.slice(0, 3);

  return (
    <section>
      <div className="flex justify-between items-center mb-8">
        <div className="text-left">
          <h2 className="text-3xl font-bold tracking-tight">Traveler Stories</h2>
          <p className="mt-2 text-lg text-muted-foreground">
            Get inspired by tales of adventure from our community.
          </p>
        </div>
        <Button variant="ghost" asChild className="hidden md:inline-flex">
          <Link href="/blog">
            Read All Stories
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {stories.map((story) => (
             // Use horizontal orientation for the main home page list on mobile
            <BlogCard key={story.id} story={story} orientation="vertical" />
        ))}
      </div>
       <Button variant="outline" asChild className="w-full mt-8 md:hidden">
          <Link href="/blog">
            Read All Stories
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
    </section>
  );
}
