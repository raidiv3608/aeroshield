import { describe, it, expect } from 'vitest';
import {
  calculateInhaledDosageMicrograms,
  calculateCorsiRosenthalMetrics,
  dosageToCigaretteEquivalence,
  calculateAvoidedEmissions
} from './mathModels';
import { FamilyMember, CorsiRosenthalConfig } from '../types/airQuality';

describe('mathModels — EPA & Aerosol Engineering Validations', () => {
  const childMember: FamilyMember = {
    id: 'f-child',
    name: 'Child',
    role: 'Child',
    sensitivity: 'high',
    ventilationRateLpm: 12,
    maskType: 'none',
    dailyOutdoorMinutes: 60,
  };

  const adultMember: FamilyMember = {
    id: 'f-adult',
    name: 'Adult',
    role: 'Adult',
    sensitivity: 'normal',
    ventilationRateLpm: 16,
    maskType: 'none',
    dailyOutdoorMinutes: 60,
  };

  describe('calculateInhaledDosageMicrograms (EPA Inhalation Model)', () => {
    it('calculates unmasked baseline exposure accurately: C * V_E * t', () => {
      // 100 µg/m³, 12 L/min = 0.012 m³/min, 60 min => 100 * 0.012 * 60 = 72 µg
      const dosage = calculateInhaledDosageMicrograms(100, 60, childMember, 'light');
      expect(dosage).toBeCloseTo(72.0, 1);
    });

    it('returns 0 if concentration or duration is 0', () => {
      expect(calculateInhaledDosageMicrograms(0, 60, childMember)).toBe(0);
      expect(calculateInhaledDosageMicrograms(100, 0, childMember)).toBe(0);
    });

    it('scales with physiological exertion level multipliers', () => {
      // Light = 1.0x (72 µg)
      const light = calculateInhaledDosageMicrograms(100, 60, childMember, 'light');
      // Resting = 0.8x
      const resting = calculateInhaledDosageMicrograms(100, 60, childMember, 'resting');
      // Moderate = 2.0x
      const moderate = calculateInhaledDosageMicrograms(100, 60, childMember, 'moderate');
      // Heavy = 3.5x
      const heavy = calculateInhaledDosageMicrograms(100, 60, childMember, 'heavy');

      expect(resting).toBeCloseTo(light * 0.8, 1);
      expect(moderate).toBeCloseTo(light * 2.0, 1);
      expect(heavy).toBeCloseTo(light * 3.5, 1);
    });

    it('applies cloth mask 30% particle filtration factor', () => {
      const clothChild: FamilyMember = { ...childMember, maskType: 'cloth' };
      const dosage = calculateInhaledDosageMicrograms(100, 60, clothChild, 'light');
      // 72 * (1 - 0.30) = 50.4 µg
      expect(dosage).toBeCloseTo(50.4, 1);
    });

    it('applies surgical mask 70% particle filtration factor', () => {
      const surgicalChild: FamilyMember = { ...childMember, maskType: 'surgical' };
      const dosage = calculateInhaledDosageMicrograms(100, 60, surgicalChild, 'light');
      // 72 * (1 - 0.70) = 21.6 µg
      expect(dosage).toBeCloseTo(21.6, 1);
    });

    it('applies N95 / FFP2 certified 95% particle filtration factor', () => {
      const n95Child: FamilyMember = { ...childMember, maskType: 'n95_ffp2' };
      const dosage = calculateInhaledDosageMicrograms(100, 60, n95Child, 'light');
      // 72 * (1 - 0.95) = 3.6 µg
      expect(dosage).toBeCloseTo(3.6, 1);
    });

    it('reflects higher ventilation rate in adults vs children', () => {
      const childDose = calculateInhaledDosageMicrograms(100, 60, childMember, 'light');
      const adultDose = calculateInhaledDosageMicrograms(100, 60, adultMember, 'light');
      expect(adultDose).toBeGreaterThan(childDose);
    });
  });

  describe('dosageToCigaretteEquivalence (Berkeley Earth Metric)', () => {
    it('converts 0 µg into 0.0 cigarettes', () => {
      expect(dosageToCigaretteEquivalence(0)).toBe(0);
    });

    it('converts 200 µg into exactly 1.0 cigarette equivalent', () => {
      expect(dosageToCigaretteEquivalence(200)).toBe(1.0);
    });

    it('converts 400 µg into 2.0 cigarette equivalents', () => {
      expect(dosageToCigaretteEquivalence(400)).toBe(2.0);
    });

    it('converts 1000 µg into 5.0 cigarette equivalents', () => {
      expect(dosageToCigaretteEquivalence(1000)).toBe(5.0);
    });
  });

  describe('calculateCorsiRosenthalMetrics (CADR & ACH Engine)', () => {
    const baseConfig: CorsiRosenthalConfig = {
      fanType: 'box_fan_20in',
      fanSpeedCfm: 550,
      filterRating: 'MERV13',
      filterCount: 4,
      filterThicknessInches: 2,
      roomAreaSqM: 20,
      roomCeilingHeightM: 2.5, // 50 m³ volume
      roomType: 'bedroom',
    };

    it('calculates CADR and ACH exceeding CDC hospital-grade standards for standard 20m² room', () => {
      const metrics = calculateCorsiRosenthalMetrics(baseConfig);
      expect(metrics.cadrCubicMetersPerHour).toBeGreaterThan(600);
      expect(metrics.ach).toBeGreaterThanOrEqual(10.0);
      expect(metrics.achRating).toBe('Optimal (Hospital/CDC Grade)');
      expect(metrics.noiseLevelDb).toBe(51);
    });

    it('boosts airflow when using the 5-filter Comparetto cube design', () => {
      const metrics4 = calculateCorsiRosenthalMetrics(baseConfig);
      const metrics5 = calculateCorsiRosenthalMetrics({ ...baseConfig, filterCount: 5 });
      expect(metrics5.cadrCubicMetersPerHour).toBeGreaterThan(metrics4.cadrCubicMetersPerHour);
      expect(metrics5.ach).toBeGreaterThan(metrics4.ach);
    });

    it('boosts airflow when using 2-inch deep pleated filters over 1-inch filters', () => {
      const metrics1in = calculateCorsiRosenthalMetrics({ ...baseConfig, filterThicknessInches: 1 });
      const metrics2in = calculateCorsiRosenthalMetrics({ ...baseConfig, filterThicknessInches: 2 });
      expect(metrics2in.cadrCubicMetersPerHour).toBeGreaterThan(metrics1in.cadrCubicMetersPerHour);
    });

    it('supports whisper-quiet PC fan array variant (38 dB)', () => {
      const pcFanMetrics = calculateCorsiRosenthalMetrics({ ...baseConfig, fanType: 'pc_fan_array' });
      expect(pcFanMetrics.noiseLevelDb).toBe(38);
    });

    it('computes substantial economic savings ($300+) compared to commercial HEPA brands', () => {
      const metrics = calculateCorsiRosenthalMetrics(baseConfig);
      expect(metrics.diyEstimatedCostUsd).toBeLessThan(100);
      expect(metrics.commercialEquivalentCostUsd).toBeGreaterThan(400);
      expect(metrics.moneySavedUsd).toBeGreaterThan(300);
    });

    it('handles large living room volume correctly', () => {
      const largeRoomMetrics = calculateCorsiRosenthalMetrics({
        ...baseConfig,
        roomAreaSqM: 60,
        roomCeilingHeightM: 3.0, // 180 m³ volume
      });
      // CADR remains high, ACH adjusts proportionately
      expect(largeRoomMetrics.ach).toBeLessThan(baseConfig.roomAreaSqM);
      expect(largeRoomMetrics.ach).toBeGreaterThan(3.0);
    });
  });

  describe('calculateAvoidedEmissions (Transit Modal Shift)', () => {
    it('calculates significant PM2.5 and CO2 savings when switching from car to metro', () => {
      const emissions = calculateAvoidedEmissions(10, 'single_ice_car', 'metro_bus');
      // Car: 175g CO2/km, Metro: 32g CO2/km => (175 - 32) * 10 / 1000 = 1.43 kg CO2
      expect(emissions.co2AvoidedKg).toBeCloseTo(1.43, 1);
      // Car: 0.038g PM2.5/km, Metro: 0.004g/km => (0.038 - 0.004) * 10 = 0.34g PM2.5
      expect(emissions.pmAvoidedGrams).toBeCloseTo(0.34, 1);
    });

    it('calculates 100% emissions avoided when switching from car to walking/cycling', () => {
      const emissions = calculateAvoidedEmissions(5, 'single_ice_car', 'walk_cycle');
      expect(emissions.co2AvoidedKg).toBeCloseTo((175 * 5) / 1000, 1);
      expect(emissions.pmAvoidedGrams).toBeCloseTo(0.038 * 5, 2);
    });

    it('returns 0 savings if transit mode does not change', () => {
      const emissions = calculateAvoidedEmissions(10, 'single_ice_car', 'single_ice_car');
      expect(emissions.co2AvoidedKg).toBe(0);
      expect(emissions.pmAvoidedGrams).toBe(0);
    });

    it('returns 0 savings if distance is 0 km', () => {
      const emissions = calculateAvoidedEmissions(0, 'single_ice_car', 'metro_bus');
      expect(emissions.co2AvoidedKg).toBe(0);
      expect(emissions.pmAvoidedGrams).toBe(0);
    });
  });
});
