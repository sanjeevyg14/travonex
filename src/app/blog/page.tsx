

"use client";

import { BlogCard } from "@/components/blog-card";
import { useMockData } from "@/hooks/use-mock-data";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Traveler Stories',
  description: 'Get inspired for your next adventure with travel stories, tips, and guides from our vibrant community of travelers on the Travonex blog.',
};

export default function BlogPage() {
  const { blogStories } = useMockData();
  return (
    <div className="container py-8">
      <div className="space-y-4 text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Traveler Stories</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Get inspired by tales of adventure, tips, and guides from our vibrant community of travelers.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {blogStories.map((story) => (
          <BlogCard key={story.id} story={story} />
        ))}
      </div>
    </div>
  );
}
