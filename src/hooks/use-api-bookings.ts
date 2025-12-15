/**
 * Custom hook for managing bookings via API
 */

import { useState, useEffect, useCallback } from "react";
import { apiGet, apiPost, ApiError } from "@/lib/api-client";
import type { Booking } from "@/lib/types";

interface UseBookingsOptions {
  organizerId?: string;
  autoFetch?: boolean;
}

export function useApiBookings(options: UseBookingsOptions = {}) {
  const { organizerId, autoFetch = true } = options;
  const [bookings, setBookings] = useState<Booking[]>([]);
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
      const endpoint = `/api/bookings${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      const data = await apiGet<{ bookings: Booking[] }>(endpoint);
      setBookings(data.bookings || []);
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : "Failed to fetch bookings";
      setError(errorMessage);
      console.error("Fetch bookings error:", err);
    } finally {
      setLoading(false);
    }
  }, [organizerId]);

  const fetchBooking = useCallback(async (bookingId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<{ booking: Booking }>(`/api/bookings/${bookingId}`);
      return data.booking;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : "Failed to fetch booking";
      setError(errorMessage);
      console.error("Fetch booking error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

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
    fetchBooking,
    refetch: fetchBookings,
  };
}

