import { describe, it, expect } from 'vitest';
import {
  calculateInhaledDosageMicrograms,
  calculateCorsiRosenthalMetrics,
  dosageToCigaretteEquivalence,
  calculateAvoidedEmissions
} from './mathModels';
import { FamilyMember, CorsiRosenthalConfig } from '../types/airQuality';

describe('AeroShield Scientific Math Models', () => {
  const mockChild: FamilyMember = {
    id: 'c-1',
    name: 'Child',
    role: 'Child',
    sensitivity: 'high',
    ventilationRateLpm: 12,
    maskType: 'none',
    dailyOutdoorMinutes: 60,
  };

  it('calculates inhaled PM2.5 dosage accurately for unmasked exposure', () => {
    // 100 µg/m³ ambient, 12 L/min = 0.012 m³/min, 60 mins => 100 * 0.012 * 60 = 72 µg
    const dosage = calculateInhaledDosageMicrograms(100, 60, mockChild, 'light');
    expect(dosage).toBeCloseTo(72, 1);
  });

  it('factors in N95 / FFP2 95% filtration efficiency', () => {
    const maskedChild: FamilyMember = { ...mockChild, maskType: 'n95_ffp2' };
    const dosage = calculateInhaledDosageMicrograms(100, 60, maskedChild, 'light');
    // 72 * 0.05 = 3.6 µg
    expect(dosage).toBeCloseTo(3.6, 1);
  });

  it('calculates cigarette equivalence accurately via Berkeley Earth conversion', () => {
    // 200 µg inhaled PM2.5 ≈ 1 cigarette
    const cigarettes = dosageToCigaretteEquivalence(400);
    expect(cigarettes).toBe(2.0);
  });

  it('computes Corsi-Rosenthal Box CADR and ACH meeting CDC hospital standards', () => {
    const config: CorsiRosenthalConfig = {
      fanType: 'box_fan_20in',
      fanSpeedCfm: 550,
      filterRating: 'MERV13',
      filterCount: 4,
      filterThicknessInches: 2,
      roomAreaSqM: 20,
      roomCeilingHeightM: 2.5, // 50 m³ volume
      roomType: 'bedroom',
    };

    const metrics = calculateCorsiRosenthalMetrics(config);
    expect(metrics.cadrCubicMetersPerHour).toBeGreaterThan(600);
    expect(metrics.ach).toBeGreaterThan(10); // > 5 ACH CDC benchmark
    expect(metrics.achRating).toBe('Optimal (Hospital/CDC Grade)');
    expect(metrics.moneySavedUsd).toBeGreaterThan(300);
  });

  it('computes avoided transit emissions when modal shifting from car to metro', () => {
    const emissions = calculateAvoidedEmissions(10, 'single_ice_car', 'metro_bus');
    expect(emissions.pmAvoidedGrams).toBeGreaterThan(0.2);
    expect(emissions.co2AvoidedKg).toBeGreaterThan(1.0);
  });
});
