"use client";

import EditExperienceForm from "./edit-form";

export default function EditExperiencePage({ params }: { params: { slug: string } }) {
  // Pass undefined to let the client component fetch the experience
  return <EditExperienceForm />;
}
