
import { notFound } from "next/navigation";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "lucide-react";
import { initialBlogStories } from "@/lib/data";
import type { Metadata } from "next";
import { ShareButtons } from "@/components/share-buttons";

// This function generates dynamic metadata for each blog post page.
// It's a special Next.js function that runs on the server.
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const story = initialBlogStories.find((s) => s.slug === params.slug);

  if (!story) {
    return {
      title: "Story Not Found",
      description: "The story you are looking for does not exist.",
    };
  }

  const imagePlaceholder = PlaceHolderImages.find((p) => p.id === story.image);
  const imageUrl = imagePlaceholder?.imageUrl || '/fallback-image.jpg';

  return {
    title: `${story.title} - Travonex`,
    description: story.excerpt,
    openGraph: {
      title: story.title,
      description: story.excerpt,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: story.title,
        },
      ],
      type: 'article',
      authors: [story.author],
    },
  };
}


// This is now a Server Component. The 'use client' directive has been removed.
export default function BlogDetailPage({ params }: { params: { slug: string } }) {
  // Data is fetched directly on the server.
  const story = initialBlogStories.find((s) => s.slug === params.slug);

  if (!story) {
    notFound();
  }

  const placeholder = PlaceHolderImages.find((p) => p.id === story.image);
  const authorAvatar = PlaceHolderImages.find((p) => p.id === "user1");

  return (
    <div>
      <section className="relative h-[40vh] w-full">
        {placeholder && (
          <Image
            src={placeholder.imageUrl}
            alt={placeholder.description}
            fill
            className="object-cover"
            data-ai-hint={placeholder.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60" />
      </section>

      <div className="container -mt-24 relative z-10">
        <div className="bg-card p-6 md:p-8 rounded-lg shadow-xl max-w-4xl mx-auto">
          <ShareButtons title={story.title} />
          <h1 className="text-3xl md:text-4xl font-bold mb-4 mt-6">{story.title}</h1>
          <div className="flex items-center gap-6 text-sm text-muted-foreground mb-8">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                {authorAvatar && <AvatarImage src={authorAvatar.imageUrl} alt={story.author} />}
                <AvatarFallback>{story.author.charAt(0)}</AvatarFallback>
              </Avatar>
              <span>{story.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{story.date}</span>
            </div>
          </div>
          <div className="prose prose-lg dark:prose-invert max-w-none prose-p:text-muted-foreground prose-headings:text-foreground prose-lead:text-lg md:prose-lead:text-xl">
            <p className="lead">{story.excerpt}</p>
            <p>{story.content}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
