import { describe, it, expect } from 'vitest';
import {
  calculateUsAqi,
  getAqiCategory,
  generateFallbackAirQuality,
  fetchLiveAirQuality,
  GLOBAL_SMOG_HOTSPOTS,
  searchGlobalCities,
} from './airQualityService';

describe('airQualityService — Core Telemetry & EPA Standards', () => {
  describe('calculateUsAqi (EPA PM2.5 Breakpoints)', () => {
    it('handles negative or zero PM2.5 safely', () => {
      expect(calculateUsAqi(-5)).toBe(0);
      expect(calculateUsAqi(0)).toBe(0);
    });

    it('calculates AQI accurately across Good category (0.0 - 12.0 µg/m³)', () => {
      expect(calculateUsAqi(6.0)).toBe(25);
      expect(calculateUsAqi(12.0)).toBe(50);
    });

    it('calculates AQI accurately across Moderate category (12.1 - 35.4 µg/m³)', () => {
      expect(calculateUsAqi(12.1)).toBe(51);
      expect(calculateUsAqi(23.75)).toBe(76);
      expect(calculateUsAqi(35.4)).toBe(100);
    });

    it('calculates AQI accurately across Unhealthy for Sensitive Groups (35.5 - 55.4 µg/m³)', () => {
      expect(calculateUsAqi(35.5)).toBe(101);
      expect(calculateUsAqi(45.45)).toBe(126);
      expect(calculateUsAqi(55.4)).toBe(150);
    });

    it('calculates AQI accurately across Unhealthy category (55.5 - 150.4 µg/m³)', () => {
      expect(calculateUsAqi(55.5)).toBe(151);
      expect(calculateUsAqi(102.95)).toBe(176);
      expect(calculateUsAqi(150.4)).toBe(200);
    });

    it('calculates AQI accurately across Very Unhealthy / Severe category (150.5 - 250.4 µg/m³)', () => {
      expect(calculateUsAqi(150.5)).toBe(201);
      expect(calculateUsAqi(250.4)).toBe(300);
    });

    it('calculates AQI accurately across Hazardous category (250.5 - 500.4 µg/m³)', () => {
      expect(calculateUsAqi(250.5)).toBe(301);
      expect(calculateUsAqi(350.4)).toBe(400);
      expect(calculateUsAqi(500.4)).toBe(500);
    });

    it('handles off-the-scale emergency concentrations (>500.4 µg/m³)', () => {
      const offTheChart = calculateUsAqi(650);
      expect(offTheChart).toBeGreaterThan(500);
    });
  });

  describe('getAqiCategory (Severity & Color Semantics)', () => {
    it('classifies Good air quality correctly', () => {
      const res = getAqiCategory(10);
      expect(res.level).toBe('good');
      expect(res.label).toBe('Good');
      expect(res.color).toBe('#10b981');
    });

    it('classifies Moderate air quality correctly', () => {
      const res = getAqiCategory(25);
      expect(res.level).toBe('moderate');
      expect(res.label).toBe('Moderate');
      expect(res.color).toBe('#f59e0b');
    });

    it('classifies Unhealthy for Sensitive Groups correctly', () => {
      const res = getAqiCategory(45);
      expect(res.level).toBe('unhealthy-sensitive');
      expect(res.label).toContain('Sensitive Groups');
    });

    it('classifies Unhealthy correctly', () => {
      const res = getAqiCategory(120);
      expect(res.level).toBe('unhealthy');
      expect(res.label).toBe('Unhealthy');
    });

    it('classifies Severe / Very Unhealthy correctly', () => {
      const res = getAqiCategory(200);
      expect(res.level).toBe('severe');
      expect(res.label).toContain('Very Unhealthy');
    });

    it('classifies Hazardous emergency smog correctly', () => {
      const res = getAqiCategory(380);
      expect(res.level).toBe('hazardous');
      expect(res.label).toContain('Hazardous');
    });
  });

  describe('generateFallbackAirQuality (Empirical Meteorological Modeling)', () => {
    it('generates a full 24-hour diurnal profile', () => {
      const snapshot = generateFallbackAirQuality('New Delhi', 'India');
      expect(snapshot.hourly.length).toBe(24);
      expect(snapshot.city).toBe('New Delhi');
      expect(snapshot.country).toBe('India');
      expect(snapshot.currentPm25).toBeGreaterThan(0);
      expect(snapshot.currentAqi).toBeGreaterThan(0);
    });

    it('models high-smog hubs with elevated baseline PM2.5', () => {
      const delhi = generateFallbackAirQuality('New Delhi', 'India');
      const london = generateFallbackAirQuality('London', 'United Kingdom');
      expect(delhi.currentPm25).toBeGreaterThan(london.currentPm25);
    });

    it('models nocturnal radiation inversion risk during early morning hours (04:00 - 09:00)', () => {
      const snapshot = generateFallbackAirQuality('Lahore', 'Pakistan');
      const earlyMorningHours = snapshot.hourly.filter(h => h.hour >= 4 && h.hour <= 9);
      earlyMorningHours.forEach(h => {
        expect(h.inversionRisk).toBe('Severe');
      });
    });

    it('identifies the afternoon golden solar dispersion window', () => {
      const snapshot = generateFallbackAirQuality('Salt Lake City', 'United States');
      const window = snapshot.goldenDispersionWindow;
      expect(window.startHour).toBeLessThanOrEqual(window.endHour);
      expect(window.startHour).toBeGreaterThanOrEqual(12);
      expect(window.endHour).toBeLessThanOrEqual(18);
      expect(window.reason).toContain('boundary layer');
    });
  });

  describe('GLOBAL_SMOG_HOTSPOTS Presets', () => {
    it('contains all required global winter smog hotspots with valid coordinates', () => {
      expect(GLOBAL_SMOG_HOTSPOTS.length).toBeGreaterThanOrEqual(5);

      const cityNames = GLOBAL_SMOG_HOTSPOTS.map(h => h.name);
      expect(cityNames).toContain('New Delhi');
      expect(cityNames).toContain('Lahore');
      expect(cityNames).toContain('Salt Lake City');
      expect(cityNames).toContain('Kraków');
      expect(cityNames).toContain('Beijing');

      GLOBAL_SMOG_HOTSPOTS.forEach(spot => {
        expect(spot.latitude).toBeGreaterThanOrEqual(-90);
        expect(spot.latitude).toBeLessThanOrEqual(90);
        expect(spot.longitude).toBeGreaterThanOrEqual(-180);
        expect(spot.longitude).toBeLessThanOrEqual(180);
        expect(spot.winterSmogCause.length).toBeGreaterThan(10);
      });
    });
  });

  describe('searchGlobalCities Query Validation', () => {
    it('returns empty array when query is empty or too short', async () => {
      expect(await searchGlobalCities('')).toEqual([]);
      expect(await searchGlobalCities(' ')).toEqual([]);
      expect(await searchGlobalCities('a')).toEqual([]);
    });
  });

  describe('fetchLiveAirQuality in-memory cache resilience', () => {
    it('returns fallback data and caches the result for repeated calls', async () => {
      const res1 = await fetchLiveAirQuality(28.61, 77.20, 'New Delhi', 'India');
      expect(res1.city).toBe('New Delhi');
      expect(res1.hourly.length).toBe(24);

      // Second immediate call retrieves from cache
      const res2 = await fetchLiveAirQuality(28.61, 77.20, 'New Delhi', 'India');
      expect(res2.city).toBe('New Delhi');
      expect(res2.currentAqi).toBe(res1.currentAqi);
    });
  });
});
