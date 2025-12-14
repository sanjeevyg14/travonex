import { useMockData } from "@/hooks/use-mock-data";
import { notFound } from "next/navigation";
import { initialExperiences } from "@/lib/data";
import EditExperienceForm from "./edit-form";

// This is required for static export with dynamic routes.
export function generateStaticParams() {
  return initialExperiences.map(experience => ({
    slug: experience.slug,
  }));
}


// This is now a Server Component responsible for fetching data.
export default function EditExperiencePage({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  // In a real app, we'd fetch from a DB here. In the prototype, we use initialData.
  const experienceToEdit = initialExperiences.find(e => e.slug === slug);

  if (!experienceToEdit) {
    notFound();
  }

  // We pass the server-fetched data to the client component.
  return <EditExperienceForm experienceToEdit={experienceToEdit} />;
}
