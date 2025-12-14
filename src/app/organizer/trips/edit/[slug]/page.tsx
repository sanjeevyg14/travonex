
"use client";

import { useMockData } from "@/hooks/use-mock-data";
import NewTripPage from "../../new/page"; // Re-use the NewTripPage component
import { notFound, useParams } from "next/navigation";
import { initialTrips } from "@/lib/data";

// This is required for static export with dynamic routes.
export function generateStaticParams() {
  return initialTrips.map(trip => ({
    slug: trip.slug,
  }));
}

// This is a new component that wraps the existing "New Trip" page
// and passes the existing trip data to it, effectively turning it into an "Edit" page.

export default function EditTripPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { trips } = useMockData();
  const tripToEdit = trips.find(t => t.slug === slug);

  if (!tripToEdit) {
    notFound();
  }

  // Render the NewTripPage but pass the existing trip data as props
  return <NewTripPage tripToEdit={tripToEdit} />;
}
