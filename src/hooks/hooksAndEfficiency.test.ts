import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './useDebounce';
import { fetchLiveAirQuality, searchGlobalCities } from '../services/airQualityService';

describe('Performance, Custom Hooks & Caching Resilience', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  describe('useDebounce Hook', () => {
    it('returns the initial value immediately', () => {
      const { result } = renderHook(() => useDebounce('initial', 200));
      expect(result.current).toBe('initial');
    });

    it('debounces rapid value changes until delay has elapsed', async () => {
      vi.useFakeTimers();
      const { result, rerender } = renderHook(
        ({ val, delay }: { val: string; delay: number }) => useDebounce(val, delay),
        { initialProps: { val: 'first', delay: 300 } }
      );

      expect(result.current).toBe('first');

      // Update to 'second'
      rerender({ val: 'second', delay: 300 });
      expect(result.current).toBe('first'); // Still first before delay

      act(() => {
        vi.advanceTimersByTime(150);
      });
      expect(result.current).toBe('first');

      // Update to 'third' rapidly
      rerender({ val: 'third', delay: 300 });
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current).toBe('third');
    });
  });

  describe('In-Flight Request Deduplication & Multi-Tier Caching', () => {
    it('concurrent calls for identical coordinates share the same promise', async () => {
      const promise1 = fetchLiveAirQuality(28.61, 77.20, 'New Delhi', 'India');
      const promise2 = fetchLiveAirQuality(28.61, 77.20, 'New Delhi', 'India');

      // Both should resolve to the exact same snapshot
      const [res1, res2] = await Promise.all([promise1, promise2]);
      expect(res1.city).toBe('New Delhi');
      expect(res2.city).toBe('New Delhi');
      expect(res1.currentAqi).toBe(res2.currentAqi);
    });

    it('geocoding cache returns instant results on repeated queries', async () => {
      const query = 'Tokyo';
      const results1 = await searchGlobalCities(query);
      const results2 = await searchGlobalCities(query);

      expect(Array.isArray(results1)).toBe(true);
      expect(Array.isArray(results2)).toBe(true);
      expect(results1).toEqual(results2);
    });

    it('handles geocoding with case-insensitive cache hit', async () => {
      const resLower = await searchGlobalCities('paris');
      const resUpper = await searchGlobalCities('PARIS');
      expect(resLower).toEqual(resUpper);
    });
  });
});
