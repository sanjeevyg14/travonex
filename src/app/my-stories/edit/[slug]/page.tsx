
"use client";

import { useMockData } from "@/hooks/use-mock-data";
import NewStoryPage from "@/app/blog/new/page"; // Re-use the NewStoryPage component
import { notFound, useParams } from "next/navigation";
import { initialBlogStories } from "@/lib/data";

// This is required for static export with dynamic routes.
export function generateStaticParams() {
  return initialBlogStories.map(story => ({
    slug: story.slug,
  }));
}

export default function EditStoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { blogStories } = useMockData();
  const storyToEdit = blogStories.find(s => s.slug === slug);

  if (!storyToEdit) {
    notFound();
  }

  // Render the NewStoryPage but pass the existing story data as a prop
  return <NewStoryPage storyToEdit={storyToEdit} />;
}
