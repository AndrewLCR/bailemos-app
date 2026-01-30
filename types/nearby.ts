export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface NearbyAcademy {
  id: string;
  type: "academy";
  name: string;
  description: string;
  location: string;
  styles: string[];
  coordinates: Coordinates;
}

export interface NearbyEvent {
  id: string;
  type: "event";
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  academyName?: string;
  coordinates: Coordinates;
}

export type NearbyPlace = NearbyAcademy | NearbyEvent;

export function isNearbyAcademy(p: NearbyPlace): p is NearbyAcademy {
  return p.type === "academy";
}

export function isNearbyEvent(p: NearbyPlace): p is NearbyEvent {
  return p.type === "event";
}
