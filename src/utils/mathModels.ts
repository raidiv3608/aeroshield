import { FamilyMember, CorsiRosenthalConfig, CorsiRosenthalMetrics, RoutineTask } from '../types/airQuality';
import {
  CFM_TO_M3_PER_HOUR,
  BERKELEY_EARTH_UG_PER_CIGARETTE,
  CDC_HOSPITAL_ACH_BENCHMARK,
  GOOD_INDOOR_ACH_BENCHMARK,
  MASK_FILTRATION_EFFICIENCIES,
  TRANSIT_EMISSION_FACTORS,
} from '../constants/smogConstants';

/**
 * Computes personal inhaled PM2.5 dosage (µg) according to EPA / WHO inhalation standards.
 * Formula: Inhaled Dose (µg) = Concentration (µg/m³) × Minute Ventilation (m³/min) × Duration (min) × (1 - Mask Efficiency)
 * Hardened against NaN, Infinity, negative values, and corrupted member profiles.
 */
export function calculateInhaledDosageMicrograms(
  pm25Concentration: number, // µg/m³
  durationMinutes: number,
  member: FamilyMember,
  exertionLevel: 'resting' | 'light' | 'moderate' | 'heavy' = 'light'
): number {
  if (
    !pm25Concentration ||
    pm25Concentration <= 0 ||
    !isFinite(pm25Concentration) ||
    !durationMinutes ||
    durationMinutes <= 0 ||
    !isFinite(durationMinutes)
  ) {
    return 0;
  }

  // Minute ventilation rates in m³/minute (EPA Exposure Factors Handbook)
  let baseLpm = member && typeof member.ventilationRateLpm === 'number' && member.ventilationRateLpm > 0
    ? member.ventilationRateLpm
    : 12;

  if (exertionLevel === 'resting') baseLpm *= 0.8;
  else if (exertionLevel === 'moderate') baseLpm *= 2.0;
  else if (exertionLevel === 'heavy') baseLpm *= 3.5;

  const minuteVentilationM3 = Math.max(0.001, baseLpm / 1000);

  // Mask filtration efficiency against fine PM2.5 particulates
  const maskType = member?.maskType || 'none';
  const filterEfficiency = MASK_FILTRATION_EFFICIENCIES[maskType] ?? 0.0;
  const effectiveInhaledFraction = Math.max(0, 1 - filterEfficiency);

  const dosage = pm25Concentration * minuteVentilationM3 * durationMinutes * effectiveInhaledFraction;
  return isFinite(dosage) ? Math.round(dosage * 10) / 10 : 0;
}

/**
 * Translates inhaled PM2.5 mass into equivalent cigarettes avoided / smoked
 * Based on the Berkeley Earth scientific metric: 22 µg/m³ for 24h exposure ≈ 1 cigarette (approx. 200 µg inhaled PM2.5)
 * Hardened against non-positive and non-finite inputs.
 */
export function dosageToCigaretteEquivalence(dosageMicrograms: number): number {
  if (!dosageMicrograms || dosageMicrograms <= 0 || !isFinite(dosageMicrograms)) return 0;
  const equiv = dosageMicrograms / BERKELEY_EARTH_UG_PER_CIGARETTE;
  return isFinite(equiv) ? Math.round(equiv * 10) / 10 : 0;
}

/**
 * Calculates Clean Air Delivery Rate (CADR) and Air Changes per Hour (ACH)
 * for a DIY Corsi-Rosenthal Box purifier.
 * Validated by UC Davis and Illinois Institute of Technology indoor aerosol engineering research.
 * Hardened against zero/negative room dimensions and invalid configurations.
 */
export function calculateCorsiRosenthalMetrics(config: CorsiRosenthalConfig): CorsiRosenthalMetrics {
  const roomArea = Math.max(1, (config && typeof config.roomAreaSqM === 'number' && config.roomAreaSqM > 0) ? config.roomAreaSqM : 20);
  const ceilingHeight = Math.max(1, (config && typeof config.roomCeilingHeightM === 'number' && config.roomCeilingHeightM > 0) ? config.roomCeilingHeightM : 2.5);
  const roomVolumeM3 = Math.max(1, roomArea * ceilingHeight);

  // Filter efficiency against fine aerosol PM2.5 (0.3 - 2.5 µm)
  const filterRating = config?.filterRating || 'MERV13';
  const filterEfficiency = filterRating === 'MERV14' ? 0.85 : (filterRating === 'HEPA' ? 0.99 : 0.75);

  const fanType = config?.fanType || 'box_fan_20in';
  const baseCfm = fanType === 'box_fan_20in' ? 550 : (fanType === 'pc_fan_array' ? 320 : 700);
  const filterCountFactor = config?.filterCount === 5 ? 1.12 : 1.0;
  const thicknessFactor = config?.filterThicknessInches === 2 ? 1.08 : 1.0;

  const totalEffectiveCfm = baseCfm * filterCountFactor * thicknessFactor;
  const cadrCfm = totalEffectiveCfm * filterEfficiency;
  const cadrM3PerHour = Math.round(cadrCfm * CFM_TO_M3_PER_HOUR);

  // Air Changes per Hour (ACH) = CADR (m³/hr) / Room Volume (m³)
  const ach = roomVolumeM3 > 0 ? Math.round((cadrM3PerHour / roomVolumeM3) * 10) / 10 : 0;

  let achRating: CorsiRosenthalMetrics['achRating'] = 'Insufficient';
  if (ach >= CDC_HOSPITAL_ACH_BENCHMARK) achRating = 'Optimal (Hospital/CDC Grade)';
  else if (ach >= GOOD_INDOOR_ACH_BENCHMARK) achRating = 'Good';

  const diyCost = config?.filterCount === 5 ? 89 : 75;
  const commercialEquivalentCost = Math.round(cadrCfm * 0.95 + 120);
  const moneySaved = Math.max(0, commercialEquivalentCost - diyCost);

  return {
    totalAirflowCfm: Math.round(totalEffectiveCfm),
    cadrCubicMetersPerHour: cadrM3PerHour,
    ach: isFinite(ach) ? ach : 0,
    achRating,
    diyEstimatedCostUsd: diyCost,
    commercialEquivalentCostUsd: commercialEquivalentCost,
    moneySavedUsd: moneySaved,
    noiseLevelDb: fanType === 'pc_fan_array' ? 38 : 51,
  };
}

/**
 * Computes vehicle emissions prevented by shifting transit modes (e.g., Car to Metro / Carpool)
 * Hardened against non-positive distances and undefined modes.
 */
export function calculateAvoidedEmissions(
  distanceKm: number,
  baselineTransit: RoutineTask['originalTransit'],
  optimizedTransit: RoutineTask['optimizedTransit']
): { pmAvoidedGrams: number; co2AvoidedKg: number } {
  if (!distanceKm || distanceKm <= 0 || !isFinite(distanceKm)) {
    return { pmAvoidedGrams: 0, co2AvoidedKg: 0 };
  }

  const base = TRANSIT_EMISSION_FACTORS[baselineTransit] || TRANSIT_EMISSION_FACTORS['single_ice_car'];
  const opt = TRANSIT_EMISSION_FACTORS[optimizedTransit] || TRANSIT_EMISSION_FACTORS['walk_cycle'];

  const co2DiffGrams = Math.max(0, (base.co2GramsPerKm - opt.co2GramsPerKm) * distanceKm);
  const pmDiffGrams = Math.max(0, (base.pm25GramsPerKm - opt.pm25GramsPerKm) * distanceKm);

  return {
    pmAvoidedGrams: Math.round(pmDiffGrams * 100) / 100,
    co2AvoidedKg: Math.round((co2DiffGrams / 1000) * 100) / 100,
  };
}
