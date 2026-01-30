import type { FeedItem } from "@/types/feed";
import axios from "axios";

const API_BASE = "http://localhost:3000/api";

const MOCK_ACADEMIES: FeedItem[] = [
  {
    id: "1",
    type: "academy",
    name: "Salsa Caliente",
    description:
      "Learn salsa, bachata, and Latin social dance in a welcoming studio.",
    imageUrl: null,
    location: "Downtown",
    styles: ["Salsa", "Bachata"],
  },
  {
    id: "2",
    type: "academy",
    name: "Tango Nuevo",
    description: "Argentine tango from beginners to performance level.",
    imageUrl: null,
    location: "Arts District",
    styles: ["Tango"],
  },
  {
    id: "3",
    type: "academy",
    name: "Bailamos Dance Co.",
    description: "Hip-hop, contemporary, and street dance for all ages.",
    imageUrl: null,
    location: "West Side",
    styles: ["Hip-hop", "Contemporary"],
  },
];

const MOCK_EVENTS: FeedItem[] = [
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
        .get<FeedItem[]>(`${API_BASE}/academies`)
        .catch(() => ({ data: null })),
      axios.get<FeedItem[]>(`${API_BASE}/events`).catch(() => ({ data: null })),
    ]);
    const academies = Array.isArray(academiesRes?.data)
      ? academiesRes.data
      : MOCK_ACADEMIES;
    const events = Array.isArray(eventsRes?.data)
      ? eventsRes.data
      : MOCK_EVENTS;
    return interleaveFeed(academies, events);
  } catch {
    return interleaveFeed(MOCK_ACADEMIES, MOCK_EVENTS);
  }
}
