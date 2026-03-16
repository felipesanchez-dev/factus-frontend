"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getDashboardDataAction } from "../infrastructure/dashboard.actions";
import type { DashboardData } from "../domain/dashboard.types";

const REFRESH_INTERVAL = 60_000; // 60 seconds

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isFetchingRef = useRef(false);

  const fetchData = useCallback(async (isInitial: boolean) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (!isInitial) setIsRefreshing(true);

    try {
      const result = await getDashboardDataAction();
      setData(result);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      if (isInitial) {
        setError(
          err instanceof Error ? err.message : "Error al cargar datos",
        );
      }
    } finally {
      if (isInitial) setLoading(false);
      setIsRefreshing(false);
      isFetchingRef.current = false;
    }
  }, []);

  // Initial load
  useEffect(() => {
    void fetchData(true);
  }, [fetchData]);

  // Auto-refresh polling
  useEffect(() => {
    const interval = window.setInterval(() => {
      void fetchData(false);
    }, REFRESH_INTERVAL);
    return () => window.clearInterval(interval);
  }, [fetchData]);

  const refresh = useCallback(() => {
    void fetchData(false);
  }, [fetchData]);

  return { data, loading, error, lastUpdated, isRefreshing, refresh };
}
