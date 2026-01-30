import {
  createBooking as createBookingApi,
  fetchBookableEvents,
  fetchMyBookings,
} from "@/api/booking";
import type { Booking } from "@/types/booking";
import type { Event } from "@/types/feed";
import { useCallback, useEffect, useState } from "react";

export function useBookableEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBookableEvents();
      setEvents(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load events");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { events, loading, error, refresh: load };
}

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyBookings();
      setBookings(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { bookings, loading, error, refresh: load };
}

export function useCreateBooking(onSuccess?: () => void) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(
    async (eventId: string) => {
      setSubmitting(true);
      setError(null);
      try {
        await createBookingApi(eventId);
        onSuccess?.();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Booking failed");
        throw e;
      } finally {
        setSubmitting(false);
      }
    },
    [onSuccess],
  );

  return { create, submitting, error };
}
