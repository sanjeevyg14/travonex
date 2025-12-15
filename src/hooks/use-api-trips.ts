/**
 * Custom hook for managing trips via API
 */

import { useState, useEffect, useCallback } from "react";
import { apiGet, ApiError } from "@/lib/api-client";
import type { Trip } from "@/lib/types";

interface UseTripsOptions {
  organizerId?: string;
  status?: string;
  limit?: number;
  autoFetch?: boolean;
}

export function useApiTrips(options: UseTripsOptions = {}) {
  const { organizerId, status, limit, autoFetch = true } = options;
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (organizerId) queryParams.append("organizerId", organizerId);
      if (status) queryParams.append("status", status);
      if (limit) queryParams.append("limit", limit.toString());
      
      const endpoint = `/api/trips${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      const data = await apiGet<{ trips: Trip[] }>(endpoint);
      setTrips(data.trips || []);
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : "Failed to fetch trips";
      setError(errorMessage);
      console.error("Fetch trips error:", err);
    } finally {
      setLoading(false);
    }
  }, [organizerId, status, limit]);

  const fetchTrip = useCallback(async (tripId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<{ trip: Trip }>(`/api/trips/${tripId}`);
      return data.trip;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : "Failed to fetch trip";
      setError(errorMessage);
      console.error("Fetch trip error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchTrips();
    }
  }, [autoFetch, fetchTrips]);

  return {
    trips,
    loading,
    error,
    fetchTrips,
    fetchTrip,
    refetch: fetchTrips,
  };
}

