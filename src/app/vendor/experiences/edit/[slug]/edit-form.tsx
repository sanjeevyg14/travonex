"use client";

import { useMockData } from "@/hooks/use-mock-data";
import NewExperiencePage from "../../new/page"; // Re-use the NewExperiencePage component
import { notFound, useParams } from "next/navigation";
import type { Experience } from "@/lib/types";


export default function EditExperienceForm({ experienceToEdit: initialExperience }: { experienceToEdit: Experience }) {
  const params = useParams();
  const slug = params.slug as string;
  const { experiences } = useMockData();
  
  // The initial data is passed as a prop, but we find the live version from context
  // to ensure any updates are reflected. Fallback to initial data if not found.
  const experienceToEdit = experiences.find(e => e.slug === slug) || initialExperience;

  if (!experienceToEdit) {
    notFound();
  }

  // Render the NewExperiencePage but pass the existing experience data as a prop
  return <NewExperiencePage experienceToEdit={experienceToEdit} />;
}
