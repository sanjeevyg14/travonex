/**
 * Custom hook for managing experiences via API
 */

import { useState, useEffect, useCallback } from "react";
import { apiGet, ApiError } from "@/lib/api-client";
import type { Experience } from "@/lib/types";

interface UseExperiencesOptions {
  vendorId?: string;
  status?: string;
  limit?: number;
  autoFetch?: boolean;
}

export function useApiExperiences(options: UseExperiencesOptions = {}) {
  const { vendorId, status, limit, autoFetch = true } = options;
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExperiences = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (vendorId) queryParams.append("vendorId", vendorId);
      if (status) queryParams.append("status", status);
      if (limit) queryParams.append("limit", limit.toString());
      
      const endpoint = `/api/experiences${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      const data = await apiGet<{ experiences: Experience[] }>(endpoint);
      setExperiences(data.experiences || []);
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : "Failed to fetch experiences";
      setError(errorMessage);
      console.error("Fetch experiences error:", err);
    } finally {
      setLoading(false);
    }
  }, [vendorId, status, limit]);

  const fetchExperience = useCallback(async (experienceId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<{ experience: Experience }>(`/api/experiences/${experienceId}`);
      return data.experience;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : "Failed to fetch experience";
      setError(errorMessage);
      console.error("Fetch experience error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchExperiences();
    }
  }, [autoFetch, fetchExperiences]);

  return {
    experiences,
    loading,
    error,
    fetchExperiences,
    fetchExperience,
    refetch: fetchExperiences,
  };
}

