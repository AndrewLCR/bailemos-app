import { fetchAcademies } from "@/api/feed";
import type { Academy } from "@/types/feed";
import { useCallback, useEffect, useState } from "react";

export function useAcademies() {
  const [academies, setAcademies] = useState<Academy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAcademies();
      setAcademies(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load academies");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { academies, loading, error, refresh: load };
}
