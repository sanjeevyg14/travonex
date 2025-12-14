
import { notFound } from "next/navigation";
import { BookingForm } from "./booking-form";
import type { Metadata } from "next";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { adminDb } from "@/lib/firebase/admin";
import { Trip } from "@/lib/types";

async function getTripBySlug(slug: string): Promise<Trip | null> {
  const q = await adminDb.collection("trips").where("slug", "==", slug).limit(1).get();
  if (q.empty) return null;
  return { id: q.docs[0].id, ...q.docs[0].data() } as Trip;
}

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
    };
  }

  const imagePlaceholder = PlaceHolderImages.find((p) => p.id === trip.image);
  const imageUrl = imagePlaceholder?.imageUrl || '/fallback-image.jpg';

  return {
    title: `Book: ${trip.title}`,
    description: `Complete your booking for ${trip.title}.`,
    openGraph: {
      title: `Book: ${trip.title}`,
      description: `Secure your spot for this adventure.`,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: trip.title,
        },
      ],
    },
  };
}

export default async function BookingPage({ params }: { params: { slug: string } }) {
  const trip = await getTripBySlug(params.slug);

  if (!trip) {
    notFound();
  }

  return <BookingForm trip={trip} />;
}
