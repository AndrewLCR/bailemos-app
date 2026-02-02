import { fetchAcademyById } from "@/api/feed";
import type { Academy } from "@/types/feed";
import { useCallback, useEffect, useState } from "react";

export function useAcademy(id: string | undefined) {
  const [academy, setAcademy] = useState<Academy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) {
      setLoading(false);
      setAcademy(null);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAcademyById(id);
      setAcademy(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load academy");
      setAcademy(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return { academy, loading, error, refresh: load };
}
