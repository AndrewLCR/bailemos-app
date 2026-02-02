import type { ClassItem } from "@/api/classes";
import { fetchClasses } from "@/api/classes";
import { useCallback, useEffect, useState } from "react";

export function useClasses() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchClasses();
      setClasses(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load classes");
      setClasses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { classes, loading, error, refresh: load };
}
