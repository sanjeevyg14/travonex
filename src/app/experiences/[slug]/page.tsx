
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { initialExperiences } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import ExperienceDetails from "./_components/experience-details";


// This is required for static export with dynamic routes.
// It can only be exported from a Server Component.
export async function generateStaticParams() {
  return initialExperiences.map(exp => ({
    slug: exp.slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const experience = initialExperiences.find((t) => t.slug === params.slug);

  if (!experience) {
    return {
      title: "Experience Not Found",
      description: "The experience you are looking for does not exist.",
    };
  }

  const imagePlaceholder = PlaceHolderImages.find((p) => p.id === experience.images[0]);
  const imageUrl = imagePlaceholder?.imageUrl || '/fallback-image.jpg';

  return {
    title: `${experience.title} - Travonex`,
    description: `Book your spot for ${experience.title}. ${experience.description.substring(0, 100)}...`,
    openGraph: {
      title: experience.title,
      description: `Book your spot for ${experience.title}.`,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: experience.title,
        },
      ],
      type: 'article',
    },
  };
}

// This is now a Server Component that fetches the data.
export default function ExperienceDetailPage({ params: { slug } }: { params: { slug: string } }) {
  const experience = initialExperiences.find((t) => t.slug === slug);

  if (!experience) {
    notFound();
  }

  // We pass the fetched experience object down to the client component.
  return <ExperienceDetails experience={experience} />;
}
