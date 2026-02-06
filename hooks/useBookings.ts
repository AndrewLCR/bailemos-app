import type { MyBookingItem } from "@/api/booking";
import {
  cancelClassBooking as cancelClassBookingApi,
  createBooking as createBookingApi,
  createClassBooking as createClassBookingApi,
  fetchBookableEvents,
  fetchMyBookings,
  fetchMyClassBookings,
} from "@/api/booking";
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
  const [bookings, setBookings] = useState<MyBookingItem[]>([]);
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
    async (eventId: string, options?: { role?: "leader" | "follower" }) => {
      setSubmitting(true);
      setError(null);
      try {
        await createBookingApi(eventId, options);
        onSuccess?.();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Booking failed");
        throw e;
      } finally {
        setSubmitting(false);
      }
    },
    [onSuccess]
  );

  return { create, submitting, error };
}

export function useCreateClassBooking(onSuccess?: () => void) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(
    async (classId: string, options?: { role?: "leader" | "follower" }) => {
      setSubmitting(true);
      setError(null);
      try {
        await createClassBookingApi(classId, options);
        onSuccess?.();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Class booking failed");
        throw e;
      } finally {
        setSubmitting(false);
      }
    },
    [onSuccess]
  );

  return { create, submitting, error };
}

export function useClassBookings() {
  const [classBookings, setClassBookings] = useState<
    Awaited<ReturnType<typeof fetchMyClassBookings>>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyClassBookings();
      setClassBookings(data);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to load class bookings"
      );
      setClassBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { classBookings, loading, error, refresh: load };
}

export function useCancelClassBooking(onSuccess?: () => void) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancel = useCallback(
    async (bookingId: string) => {
      setSubmitting(true);
      setError(null);
      try {
        await cancelClassBookingApi(bookingId);
        onSuccess?.();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Cancel failed");
        throw e;
      } finally {
        setSubmitting(false);
      }
    },
    [onSuccess]
  );

  return { cancel, submitting, error };
}
