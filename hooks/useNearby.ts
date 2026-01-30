import { fetchNearby } from "@/api/nearby";
import type { NearbyPlace } from "@/types/nearby";
import { useCallback, useEffect, useState } from "react";

export function useNearby() {
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNearby();
      setPlaces(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load nearby places");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { places, loading, error, refresh: load };
}
