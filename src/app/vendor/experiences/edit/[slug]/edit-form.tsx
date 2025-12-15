"use client";

import NewExperiencePage from "../../new/page";
import { notFound, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import type { Experience } from "@/lib/types";

export default function EditExperienceForm({ experienceToEdit: initialExperience }: { experienceToEdit?: Experience } = {}) {
  const params = useParams();
  const slug = params.slug as string;
  const [experienceToEdit, setExperienceToEdit] = useState<Experience | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchExperience() {
      if (initialExperience) {
        setExperienceToEdit(initialExperience);
        setLoading(false);
        return;
      }

      try {
        // First, get all experiences for this vendor to find by slug
        const response = await fetch('/api/experiences', {
          credentials: 'include',
        });
        if (!response.ok) throw new Error('Failed to fetch experiences');
        const data = await response.json();
        const exp = data.experiences?.find((e: Experience) => e.slug === slug);
        
        if (exp) {
          // Fetch full experience details by ID
          const expResponse = await fetch(`/api/experiences/${exp.id}`, {
            credentials: 'include',
          });
          if (expResponse.ok) {
            const expData = await expResponse.json();
            setExperienceToEdit(expData.experience);
          } else {
            setExperienceToEdit(null);
          }
        } else {
          setExperienceToEdit(null);
        }
      } catch (error) {
        console.error("Failed to fetch experience:", error);
        setExperienceToEdit(null);
      } finally {
        setLoading(false);
      }
    }

    fetchExperience();
  }, [slug, initialExperience]);

  if (loading) {
    return <div className="container py-12">Loading experience...</div>;
  }

  if (!experienceToEdit) {
    notFound();
  }

  return <NewExperiencePage experienceToEdit={experienceToEdit} />;
}
