import { API_BASE } from "@/constants/api";
import type {
  Booking,
  CreateBookingPayload,
  CreateBookingResponse,
} from "@/types/booking";
import type { Event } from "@/types/feed";
import axios from "axios";

export async function fetchBookableEvents(): Promise<Event[]> {
  try {
    const res = await axios
      .get<Event[]>(`${API_BASE}/events`)
      .catch(() => ({ data: null }));
    return Array.isArray(res?.data) ? res.data : [];
  } catch {
    return [];
  }
}

/** Raw item from GET academy/bookings/my (event or class booking). */
export type MyBookingItem =
  | Booking
  | {
      id: string;
      classId?: string;
      className?: string;
      schedule?: string;
      class_name?: string;
      class?: { name?: string };
      role?: string;
      status?: string;
      createdAt?: string;
      [key: string]: unknown;
    };

export async function fetchMyBookings(): Promise<MyBookingItem[]> {
  try {
    const res = await axios
      .get<MyBookingItem[]>(`${API_BASE}/academy/bookings/my`)
      .catch(() => ({ data: null }));
    return Array.isArray(res?.data) ? res.data : [];
  } catch {
    return [];
  }
}

export async function createBooking(
  eventId: string,
  options?: { role?: "leader" | "follower" }
): Promise<CreateBookingResponse> {
  const payload: CreateBookingPayload = { eventId };
  if (options?.role) payload.role = options.role;
  try {
    const res = await axios
      .post<CreateBookingResponse>(`${API_BASE}/bookings`, payload)
      .catch(() => null);
    if (res?.data?.booking) return res.data;
  } catch {
    // fall through
  }
  throw new Error("Event not found");
}

/** Payload for class booking (POST academy/bookings). */
export interface CreateClassBookingPayload {
  classId: string;
  role?: "leader" | "follower";
}

export async function createClassBooking(
  classId: string,
  options?: { role?: "leader" | "follower" }
): Promise<void> {
  const payload: CreateClassBookingPayload = { classId };
  if (options?.role) payload.role = options.role;
  await axios.post(`${API_BASE}/academy/bookings`, payload);
}

/** Class booking returned by GET academy/bookings. */
export interface ClassBooking {
  id: string;
  classId: string;
  role?: "leader" | "follower";
  status?: string;
  createdAt?: string;
}

export async function fetchMyClassBookings(): Promise<ClassBooking[]> {
  const res = await axios
    .get<ClassBooking[]>(`${API_BASE}/academy/bookings/my`)
    .catch(() => ({ data: [] }));
  return Array.isArray(res?.data) ? res.data : [];
}

export async function cancelClassBooking(bookingId: string): Promise<void> {
  await axios.delete(`${API_BASE}/academy/bookings/${bookingId}`);
}
