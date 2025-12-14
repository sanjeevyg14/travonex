
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import TripDetails from "./_components/trip-details";
import { adminDb } from "@/lib/firebase/admin";
import { Trip } from "@/lib/types";

// Helper to fetch trip by slug
async function getTripBySlug(slug: string): Promise<Trip | null> {
  const q = await adminDb.collection("trips").where("slug", "==", slug).limit(1).get();
  if (q.empty) return null;
  return { id: q.docs[0].id, ...q.docs[0].data() } as Trip;
}

// Generate params for STATIC pages at build time. 
// We can fetch ALL published trips here.
export async function generateStaticParams() {
  const snapshot = await adminDb.collection("trips").select("slug").get();
  return snapshot.docs.map(doc => ({
    slug: doc.data().slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const trip = await getTripBySlug(params.slug);

  if (!trip) {
    return {
      title: "Trip Not Found",
      description: "The trip you are looking for does not exist.",
    };
  }

  const imagePlaceholder = PlaceHolderImages.find((p) => p.id === trip.image);
  const imageUrl = imagePlaceholder?.imageUrl || '/fallback-image.jpg';

  return {
    title: `${trip.title} - Travonex`,
    description: trip.shortDescription,
    openGraph: {
      title: trip.title,
      description: trip.shortDescription,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: trip.title,
        },
      ],
      type: 'article',
    },
  };
}

export default async function TripDetailPage({ params: { slug } }: { params: { slug: string } }) {
  const trip = await getTripBySlug(slug);

  if (!trip) {
    notFound();
  }

  return <TripDetails trip={trip} slug={slug} />;
}
