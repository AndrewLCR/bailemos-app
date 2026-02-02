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

export type BookingRole = "leader" | "follower";

export interface CreateBookingPayload {
  eventId: string;
  role?: BookingRole;
}

export interface CreateBookingResponse {
  booking: Booking;
}
