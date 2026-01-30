export type BookingStatus = "confirmed" | "cancelled" | "pending";

export interface Booking {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  location: string;
  academyName?: string;
  status: BookingStatus;
  createdAt: string;
}

export interface CreateBookingPayload {
  eventId: string;
}

export interface CreateBookingResponse {
  booking: Booking;
}
