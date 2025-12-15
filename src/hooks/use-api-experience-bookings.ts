/**
 * Custom hook for managing experience bookings via API
 */

import { useState, useEffect, useCallback } from "react";
import { apiGet, ApiError } from "@/lib/api-client";
import type { ExperienceBooking } from "@/lib/types";

interface UseExperienceBookingsOptions {
  organizerId?: string;
  autoFetch?: boolean;
}

export function useApiExperienceBookings(options: UseExperienceBookingsOptions = {}) {
  const { organizerId, autoFetch = true } = options;
  const [bookings, setBookings] = useState<ExperienceBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (organizerId) {
        queryParams.append("organizerId", organizerId);
      }
      const endpoint = `/api/experiences/bookings${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      const data = await apiGet<{ bookings: ExperienceBooking[] }>(endpoint);
      setBookings(data.bookings || []);
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : "Failed to fetch experience bookings";
      setError(errorMessage);
      console.error("Fetch experience bookings error:", err);
    } finally {
      setLoading(false);
    }
  }, [organizerId]);

  useEffect(() => {
    if (autoFetch) {
      fetchBookings();
    }
  }, [autoFetch, fetchBookings]);

  return {
    bookings,
    loading,
    error,
    fetchBookings,
    refetch: fetchBookings,
  };
}

