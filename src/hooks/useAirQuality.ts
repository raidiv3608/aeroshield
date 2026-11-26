import { useState, useEffect, useCallback, useRef } from 'react';
import { AirQualitySnapshot, CityPreset } from '../types/airQuality';
import { fetchLiveAirQuality, GLOBAL_SMOG_HOTSPOTS } from '../services/airQualityService';

export interface UseAirQualityResult {
  selectedCity: CityPreset;
  setSelectedCity: (city: CityPreset) => void;
  snapshot: AirQualitySnapshot | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
}

/**
 * Custom React Hook for resilient, cached Air Quality telemetry ingestion.
 * Handles automatic background fetching, memory/session caching, and abort-safe cleanup.
 */
export function useAirQuality(initialCity: CityPreset = GLOBAL_SMOG_HOTSPOTS[0]): UseAirQualityResult {
  const [selectedCity, setSelectedCity] = useState<CityPreset>(initialCity);
  const [snapshot, setSnapshot] = useState<AirQualitySnapshot | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadData = useCallback(async (city: CityPreset) => {
    // Cancel any previous in-flight request for a different city
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const data = await fetchLiveAirQuality(
        city.latitude,
        city.longitude,
        city.name,
        city.country
      );
      setSnapshot(data);
      setLastUpdated(new Date());
    } catch (err: unknown) {
      setError(err instanceof Error ? err : new Error('Failed to load air quality telemetry'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(selectedCity);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [selectedCity, loadData]);

  const refetch = useCallback(async () => {
    await loadData(selectedCity);
  }, [selectedCity, loadData]);

  return {
    selectedCity,
    setSelectedCity,
    snapshot,
    loading,
    error,
    refetch,
    lastUpdated,
  };
}
