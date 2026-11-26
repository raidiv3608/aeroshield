import { describe, it, expect } from 'vitest';
import {
  calculateUsAqi,
  getAqiCategory,
  searchGlobalCities,
} from '../services/airQualityService';
import {
  calculateInhaledDosageMicrograms,
  dosageToCigaretteEquivalence,
  calculateCorsiRosenthalMetrics,
  calculateAvoidedEmissions,
} from '../utils/mathModels';
import { runMultiAgentUrbanDefense } from './agentOrchestrator';
import { generateFallbackAirQuality } from '../services/airQualityService';
import { FamilyMember, CorsiRosenthalConfig } from '../types/airQuality';

describe('System-Wide Edge Cases & Mathematical Boundary Resilience', () => {
  const dummyMember: FamilyMember = {
    id: 'f-edge',
    name: 'Edge Persona',
    role: 'Adult',
    sensitivity: 'normal',
    ventilationRateLpm: 15,
    maskType: 'none',
    dailyOutdoorMinutes: 60,
  };

  describe('AQI Mathematical Edge Cases', () => {
    it('handles NaN, Infinity, and undefined gracefully without throwing', () => {
      expect(calculateUsAqi(NaN)).toBe(0);
      expect(calculateUsAqi(Infinity)).toBeLessThanOrEqual(999);
      expect(calculateUsAqi(-Infinity)).toBe(0);
      expect(calculateUsAqi(-99999)).toBe(0);
      expect(calculateUsAqi(0)).toBe(0);
      expect(calculateUsAqi(0.0001)).toBe(0);
    });

    it('clamps apocalyptic emergency concentrations (e.g. 1500 µg/m³) safely to 999', () => {
      const extreme = calculateUsAqi(1500);
      expect(extreme).toBe(999);
    });

    it('getAqiCategory handles NaN and negative values by falling back to Good', () => {
      const resNaN = getAqiCategory(NaN);
      expect(resNaN.level).toBe('good');
      const resNeg = getAqiCategory(-50);
      expect(resNeg.level).toBe('good');
    });
  });

  describe('Inhaled Dosage Edge Cases', () => {
    it('returns 0 for negative, zero, NaN, or non-finite inputs', () => {
      expect(calculateInhaledDosageMicrograms(-50, 60, dummyMember)).toBe(0);
      expect(calculateInhaledDosageMicrograms(100, -30, dummyMember)).toBe(0);
      expect(calculateInhaledDosageMicrograms(NaN, 60, dummyMember)).toBe(0);
      expect(calculateInhaledDosageMicrograms(100, NaN, dummyMember)).toBe(0);
      expect(calculateInhaledDosageMicrograms(Infinity, 60, dummyMember)).toBe(0);
    });

    it('handles corrupted member profile with 0 or negative ventilation rate', () => {
      const corrupted: FamilyMember = { ...dummyMember, ventilationRateLpm: -10 };
      const dosage = calculateInhaledDosageMicrograms(100, 60, corrupted);
      expect(dosage).toBeGreaterThan(0); // Uses safe default 12 L/min
    });

    it('handles undefined or corrupted mask type by falling back to 0% filtration', () => {
      const corruptedMask: FamilyMember = { ...dummyMember, maskType: 'unknown' as any };
      const dosage = calculateInhaledDosageMicrograms(100, 60, corruptedMask);
      expect(dosage).toBeGreaterThan(0);
    });
  });

  describe('Cigarette Equivalence Edge Cases', () => {
    it('returns 0 for zero, negative, NaN, or Infinity', () => {
      expect(dosageToCigaretteEquivalence(0)).toBe(0);
      expect(dosageToCigaretteEquivalence(-100)).toBe(0);
      expect(dosageToCigaretteEquivalence(NaN)).toBe(0);
      expect(dosageToCigaretteEquivalence(Infinity)).toBe(0);
    });
  });

  describe('Corsi-Rosenthal Purifier Extreme Room Geometry', () => {
    it('prevents division by zero when room dimensions are zero or negative', () => {
      const zeroRoom: CorsiRosenthalConfig = {
        fanType: 'box_fan_20in',
        fanSpeedCfm: 550,
        filterRating: 'MERV13',
        filterCount: 4,
        filterThicknessInches: 2,
        roomAreaSqM: 0,
        roomCeilingHeightM: 0,
        roomType: 'bedroom',
      };

      const metrics = calculateCorsiRosenthalMetrics(zeroRoom);
      expect(isFinite(metrics.ach)).toBe(true);
      expect(metrics.ach).toBeGreaterThan(0);
      expect(metrics.cadrCubicMetersPerHour).toBeGreaterThan(0);
    });

    it('handles negative room dimensions gracefully', () => {
      const negRoom: CorsiRosenthalConfig = {
        fanType: 'box_fan_20in',
        fanSpeedCfm: 550,
        filterRating: 'MERV13',
        filterCount: 4,
        filterThicknessInches: 2,
        roomAreaSqM: -25,
        roomCeilingHeightM: -3,
        roomType: 'living_room',
      };

      const metrics = calculateCorsiRosenthalMetrics(negRoom);
      expect(isFinite(metrics.ach)).toBe(true);
      expect(metrics.ach).toBeGreaterThan(0);
    });
  });

  describe('Avoided Emissions Edge Cases', () => {
    it('returns zero avoided emissions for negative or non-finite distances', () => {
      expect(calculateAvoidedEmissions(-15, 'single_ice_car', 'metro_bus')).toEqual({ pmAvoidedGrams: 0, co2AvoidedKg: 0 });
      expect(calculateAvoidedEmissions(NaN, 'single_ice_car', 'metro_bus')).toEqual({ pmAvoidedGrams: 0, co2AvoidedKg: 0 });
      expect(calculateAvoidedEmissions(Infinity, 'single_ice_car', 'metro_bus')).toEqual({ pmAvoidedGrams: 0, co2AvoidedKg: 0 });
    });

    it('handles invalid transit mode gracefully', () => {
      const res = calculateAvoidedEmissions(10, 'invalid_mode' as any, 'metro_bus');
      expect(isFinite(res.co2AvoidedKg)).toBe(true);
      expect(isFinite(res.pmAvoidedGrams)).toBe(true);
    });
  });

  describe('Geocoding Input Sanitization & Attack Resilience', () => {
    it('handles null, undefined, and non-string inputs safely', async () => {
      expect(await searchGlobalCities(null as any)).toEqual([]);
      expect(await searchGlobalCities(undefined as any)).toEqual([]);
      expect(await searchGlobalCities(12345 as any)).toEqual([]);
    });

    it('handles XSS and SQL injection strings safely without throwing', async () => {
      const xss = '<script>alert(1)</script>';
      const res = await searchGlobalCities(xss);
      expect(Array.isArray(res)).toBe(true);

      const sqli = "' OR '1'='1";
      const resSqli = await searchGlobalCities(sqli);
      expect(Array.isArray(resSqli)).toBe(true);
    });

    it('handles excessively long strings (>200 chars) by rejecting early', async () => {
      const longString = 'a'.repeat(300);
      expect(await searchGlobalCities(longString)).toEqual([]);
    });
  });

  describe('Multi-Agent Orchestrator Extreme Cases', () => {
    it('handles snapshot with missing city name or country', () => {
      const snapshot = generateFallbackAirQuality('', '');
      const crConfig: CorsiRosenthalConfig = {
        fanType: 'box_fan_20in',
        fanSpeedCfm: 550,
        filterRating: 'MERV13',
        filterCount: 4,
        filterThicknessInches: 2,
        roomAreaSqM: 25,
        roomCeilingHeightM: 2.7,
        roomType: 'living_room',
      };

      const result = runMultiAgentUrbanDefense(snapshot, [], crConfig);
      expect(result.aeroSenseSummary).toBeDefined();
      expect(result.optimizedRoutineTasks.length).toBeGreaterThan(0);
      expect(result.familyDosageComparison.baselineTotalUrg).toBeGreaterThan(0);
    });
  });
});
