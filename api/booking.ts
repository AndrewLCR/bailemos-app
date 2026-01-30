import type { Booking, CreateBookingResponse } from "@/types/booking";
import type { Event } from "@/types/feed";
import axios from "axios";

const API_BASE = "http://localhost:3000/api";

const MOCK_EVENTS: Event[] = [
  {
    id: "e1",
    type: "event",
    title: "Friday Salsa Social",
    description: "Open social with live band. All levels welcome.",
    imageUrl: null,
    date: "2025-02-07",
    time: "20:00",
    location: "Salsa Caliente Studio",
    academyName: "Salsa Caliente",
  },
  {
    id: "e2",
    type: "event",
    title: "Bachata Workshop",
    description: "2-hour workshop focusing on musicality and connection.",
    imageUrl: null,
    date: "2025-02-08",
    time: "14:00",
    location: "Tango Nuevo",
    academyName: "Tango Nuevo",
  },
  {
    id: "e3",
    type: "event",
    title: "Milonga Night",
    description: "Traditional Argentine tango milonga with DJ.",
    imageUrl: null,
    date: "2025-02-09",
    time: "21:00",
    location: "Tango Nuevo",
    academyName: "Tango Nuevo",
  },
];

export async function fetchBookableEvents(): Promise<Event[]> {
  try {
    const res = await axios
      .get<Event[]>(`${API_BASE}/events`)
      .catch(() => ({ data: null }));
    return Array.isArray(res?.data) ? res.data : MOCK_EVENTS;
  } catch {
    return MOCK_EVENTS;
  }
}

export async function fetchMyBookings(): Promise<Booking[]> {
  try {
    const res = await axios
      .get<Booking[]>(`${API_BASE}/bookings`)
      .catch(() => ({ data: null }));
    return Array.isArray(res?.data) ? res.data : [];
  } catch {
    return [];
  }
}

export async function createBooking(
  eventId: string,
): Promise<CreateBookingResponse> {
  try {
    const res = await axios
      .post<CreateBookingResponse>(`${API_BASE}/bookings`, { eventId })
      .catch(() => null);
    if (res?.data?.booking) return res.data;
  } catch {
    // fall through to mock
  }
  const event = MOCK_EVENTS.find((e) => e.id === eventId);
  if (!event) throw new Error("Event not found");
  const booking: Booking = {
    id: `b-${Date.now()}`,
    eventId: event.id,
    eventTitle: event.title,
    eventDate: event.date,
    eventTime: event.time,
    location: event.location,
    academyName: event.academyName,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  };
  return { booking };
}
