export interface Academy {
  id: string;
  type: "academy";
  name: string;
  description: string;
  imageUrl: string | null;
  location: string;
  styles: string[];
}

export interface Event {
  id: string;
  type: "event";
  title: string;
  description: string;
  imageUrl: string | null;
  date: string;
  time: string;
  location: string;
  academyName?: string;
}

export type FeedItem = Academy | Event;

export function isAcademy(item: FeedItem): item is Academy {
  return item.type === "academy";
}

export function isEvent(item: FeedItem): item is Event {
  return item.type === "event";
}
