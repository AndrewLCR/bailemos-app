import { fetchNearby, type NearbyCoords } from "@/api/nearby";
import type { NearbyPlace } from "@/types/nearby";
import { useCallback, useEffect, useState } from "react";

export function useNearby(coords?: NearbyCoords | null) {
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const lat = coords?.latitude;
  const lng = coords?.longitude;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const location =
        lat != null && lng != null
          ? { latitude: lat, longitude: lng }
          : undefined;
      const data = await fetchNearby(location);
      setPlaces(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load nearby places");
    } finally {
      setLoading(false);
    }
  }, [lat, lng]);

  useEffect(() => {
    load();
  }, [load]);

  return { places, loading, error, refresh: load };
}
