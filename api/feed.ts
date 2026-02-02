import { API_BASE } from "@/constants/api";
import type { Academy, FeedItem } from "@/types/feed";
import axios from "axios";

function interleaveFeed(academies: FeedItem[], events: FeedItem[]): FeedItem[] {
  const result: FeedItem[] = [];
  let a = 0;
  let e = 0;
  while (a < academies.length || e < events.length) {
    if (e >= events.length || (a < academies.length && a <= e)) {
      result.push(academies[a++]);
    } else {
      result.push(events[e++]);
    }
  }
  return result;
}

export async function fetchFeed(): Promise<FeedItem[]> {
  try {
    const [academiesRes, eventsRes] = await Promise.all([
      axios
        .get<FeedItem[]>(`${API_BASE}/academy/academies`)
        .catch(() => ({ data: null })),
      axios.get<FeedItem[]>(`${API_BASE}/events`).catch(() => ({ data: null })),
    ]);
    const academies = Array.isArray(academiesRes?.data)
      ? academiesRes.data
      : [];
    const events = Array.isArray(eventsRes?.data) ? eventsRes.data : [];
    return interleaveFeed(academies, events);
  } catch {
    return interleaveFeed([], []);
  }
}

export async function fetchAcademies(): Promise<Academy[]> {
  try {
    const res = await axios
      .get<Academy[]>(`${API_BASE}/academy/academies`)
      .catch(() => ({ data: null }));
    return Array.isArray(res?.data) ? res.data : [];
  } catch {
    return [];
  }
}

export async function fetchAcademyById(id: string): Promise<Academy | null> {
  try {
    const res = await axios
      .get<Academy>(`${API_BASE}/academy/${id}`)
      .catch(() => ({ data: null }));
    if (res?.data && typeof res.data === "object" && res.data._id) {
      return res.data as Academy;
    }
    return null;
  } catch {
    return null;
  }
}
