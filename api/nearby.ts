import type { NearbyPlace } from "@/types/nearby";
import axios from "axios";

const API_BASE = "http://localhost:3000/api";

// Mock center (e.g. city center) and offsets for demo markers
const CENTER = { latitude: 37.7749, longitude: -122.4194 };

function buildMockNearby(center: {
  latitude: number;
  longitude: number;
}): NearbyPlace[] {
  return [
    {
      id: "1",
      type: "academy",
      name: "Salsa Caliente",
      description: "Learn salsa, bachata, and Latin social dance.",
      location: "Downtown",
      styles: ["Salsa", "Bachata"],
      coordinates: {
        latitude: center.latitude + 0.008,
        longitude: center.longitude - 0.005,
      },
    },
    {
      id: "2",
      type: "academy",
      name: "Tango Nuevo",
      description: "Argentine tango from beginners to performance level.",
      location: "Arts District",
      styles: ["Tango"],
      coordinates: {
        latitude: center.latitude - 0.006,
        longitude: center.longitude + 0.004,
      },
    },
    {
      id: "3",
      type: "academy",
      name: "Bailamos Dance Co.",
      description: "Hip-hop, contemporary, and street dance for all ages.",
      location: "West Side",
      styles: ["Hip-hop", "Contemporary"],
      coordinates: {
        latitude: center.latitude + 0.004,
        longitude: center.longitude + 0.007,
      },
    },
    {
      id: "e1",
      type: "event",
      title: "Friday Salsa Social",
      description: "Open social with live band.",
      date: "2025-02-07",
      time: "20:00",
      location: "Salsa Caliente Studio",
      academyName: "Salsa Caliente",
      coordinates: {
        latitude: center.latitude + 0.009,
        longitude: center.longitude - 0.004,
      },
    },
    {
      id: "e2",
      type: "event",
      title: "Bachata Workshop",
      description: "2-hour workshop on musicality and connection.",
      date: "2025-02-08",
      time: "14:00",
      location: "Tango Nuevo",
      academyName: "Tango Nuevo",
      coordinates: {
        latitude: center.latitude - 0.005,
        longitude: center.longitude + 0.005,
      },
    },
  ];
}

export interface NearbyCoords {
  latitude: number;
  longitude: number;
}

export async function fetchNearby(
  coords?: NearbyCoords | null,
): Promise<NearbyPlace[]> {
  const params =
    coords != null
      ? {
          latitude: String(coords.latitude),
          longitude: String(coords.longitude),
        }
      : undefined;
  const query = params ? `?${new URLSearchParams(params).toString()}` : "";
  try {
    const res = await axios
      .get<NearbyPlace[]>(`${API_BASE}/nearby${query}`)
      .catch(() => ({ data: null }));
    if (Array.isArray(res?.data)) return res.data;
    const center = coords ?? CENTER;
    return buildMockNearby(center);
  } catch {
    const center = coords ?? CENTER;
    return buildMockNearby(center);
  }
}

export { CENTER as DEFAULT_MAP_CENTER };
