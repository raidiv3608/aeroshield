import { FamilyMember, CorsiRosenthalConfig, CorsiRosenthalMetrics, RoutineTask } from '../types/airQuality';

/**
 * Computes personal inhaled PM2.5 dosage (µg) according to EPA / WHO inhalation standards.
 * Formula: Inhaled Dose (µg) = Concentration (µg/m³) × Minute Ventilation (m³/min) × Duration (min) × (1 - Mask Efficiency)
 */
export function calculateInhaledDosageMicrograms(
  pm25Concentration: number, // µg/m³
  durationMinutes: number,
  member: FamilyMember,
  exertionLevel: 'resting' | 'light' | 'moderate' | 'heavy' = 'light'
): number {
  // Minute ventilation rates in m³/minute (EPA Exposure Factors Handbook)
  // 1 Litre = 0.001 m³
  let baseLpm = member.ventilationRateLpm;
  if (exertionLevel === 'resting') baseLpm *= 0.8;
  else if (exertionLevel === 'moderate') baseLpm *= 2.0;
  else if (exertionLevel === 'heavy') baseLpm *= 3.5;

  const minuteVentilationM3 = baseLpm / 1000;

  // Mask filtration efficiency against fine PM2.5 particulates
  const maskEfficiencyMap: Record<FamilyMember['maskType'], number> = {
    none: 0.0,
    cloth: 0.30,      // 30% filtration of sub-micron particles
    surgical: 0.70,   // 70% with standard fit
    n95_ffp2: 0.95    // 95% certified tight fit
  };

  const filterEfficiency = maskEfficiencyMap[member.maskType] ?? 0.0;
  const effectiveInhaledFraction = 1 - filterEfficiency;

  const dosage = pm25Concentration * minuteVentilationM3 * durationMinutes * effectiveInhaledFraction;
  return Math.round(dosage * 10) / 10;
}

/**
 * Translates inhaled PM2.5 mass into equivalent cigarettes avoided / smoked
 * Based on the Berkeley Earth scientific metric: 22 µg/m³ for 24h exposure ≈ 1 cigarette (approx. 200 µg inhaled PM2.5)
 */
export function dosageToCigaretteEquivalence(dosageMicrograms: number): number {
  const microgramsPerCigaretteEquivalent = 200;
  return Math.round((dosageMicrograms / microgramsPerCigaretteEquivalent) * 10) / 10;
}

/**
 * Calculates Clean Air Delivery Rate (CADR) and Air Changes per Hour (ACH)
 * for a DIY Corsi-Rosenthal Box purifier.
 * Validated by UC Davis and Illinois Institute of Technology indoor aerosol engineering research.
 */
export function calculateCorsiRosenthalMetrics(config: CorsiRosenthalConfig): CorsiRosenthalMetrics {
  // Room Volume in m³
  const roomVolumeM3 = config.roomAreaSqM * config.roomCeilingHeightM;

  // Filter efficiency against fine aerosol PM2.5 (0.3 - 2.5 µm)
  const filterEfficiency = config.filterRating === 'MERV14' ? 0.85 : (config.filterRating === 'HEPA' ? 0.99 : 0.75); // MERV13 ≈ 75-80% for fine PM

  // Effective CFM: Corsi-Rosenthal boxes with 4-5 filters drastically reduce pressure drop (resistance),
  // allowing a standard 20-inch box fan to deliver high throughput (~500 - 650 CFM)
  const baseCfm = config.fanType === 'box_fan_20in' ? 550 : (config.fanType === 'pc_fan_array' ? 320 : 700);
  const filterCountFactor = config.filterCount === 5 ? 1.12 : 1.0;
  const thicknessFactor = config.filterThicknessInches === 2 ? 1.08 : 1.0;

  const totalEffectiveCfm = baseCfm * filterCountFactor * thicknessFactor;
  // CADR in CFM = CFM × Filtration Efficiency
  const cadrCfm = totalEffectiveCfm * filterEfficiency;

  // Convert CADR CFM to m³/hr (1 CFM = 1.69901 m³/hr)
  const cadrM3PerHour = Math.round(cadrCfm * 1.69901);

  // Air Changes per Hour (ACH) = CADR (m³/hr) / Room Volume (m³)
  const ach = roomVolumeM3 > 0 ? Math.round((cadrM3PerHour / roomVolumeM3) * 10) / 10 : 0;

  let achRating: CorsiRosenthalMetrics['achRating'] = 'Insufficient';
  if (ach >= 5.0) achRating = 'Optimal (Hospital/CDC Grade)';
  else if (ach >= 3.0) achRating = 'Good';

  // Cost estimates: DIY Box Fan ($22) + 4x MERV-13 filters ($45) + Duct tape & shroud ($8) ≈ $75
  const diyCost = config.filterCount === 5 ? 89 : 75;
  // A commercial HEPA purifier with ~350 CFM CADR (e.g. Coway / Blueair / Medify) costs $380 - $550
  const commercialEquivalentCost = Math.round(cadrCfm * 0.95 + 120);
  const moneySaved = Math.max(0, commercialEquivalentCost - diyCost);

  return {
    totalAirflowCfm: Math.round(totalEffectiveCfm),
    cadrCubicMetersPerHour: cadrM3PerHour,
    ach,
    achRating,
    diyEstimatedCostUsd: diyCost,
    commercialEquivalentCostUsd: commercialEquivalentCost,
    moneySavedUsd: moneySaved,
    noiseLevelDb: config.fanType === 'pc_fan_array' ? 38 : 51, // PC fan arrays are ultra-quiet whisper-quiet
  };
}

/**
 * Computes vehicle emissions prevented by shifting transit modes (e.g., Car to Metro / Carpool)
 * Emission Factors derived from EPA & EEA road vehicle inventory:
 * - Single ICE Petrol/Diesel Car: ~170g CO2/km, ~0.035g PM2.5/km (exhaust + brake/tire wear)
 * - Metro / Electric Rail: ~25g CO2/km per passenger, ~0.002g PM2.5/km
 * - Two-wheeler: ~75g CO2/km, ~0.025g PM2.5/km
 * - Walking / Cycling: 0g
 */
export function calculateAvoidedEmissions(
  distanceKm: number,
  baselineTransit: RoutineTask['originalTransit'],
  optimizedTransit: RoutineTask['optimizedTransit']
): { pmAvoidedGrams: number; co2AvoidedKg: number } {
  const emissionFactors = {
    single_ice_car: { co2GramsPerKm: 175, pm25GramsPerKm: 0.038 },
    two_wheeler:    { co2GramsPerKm: 80,  pm25GramsPerKm: 0.025 },
    metro_bus:      { co2GramsPerKm: 32,  pm25GramsPerKm: 0.004 },
    carpool:        { co2GramsPerKm: 58,  pm25GramsPerKm: 0.012 },
    walk_cycle:     { co2GramsPerKm: 0,   pm25GramsPerKm: 0.000 },
  };

  const base = emissionFactors[baselineTransit];
  const opt = emissionFactors[optimizedTransit];

  const co2DiffGrams = Math.max(0, (base.co2GramsPerKm - opt.co2GramsPerKm) * distanceKm);
  const pmDiffGrams = Math.max(0, (base.pm25GramsPerKm - opt.pm25GramsPerKm) * distanceKm);

  return {
    pmAvoidedGrams: Math.round(pmDiffGrams * 100) / 100,
    co2AvoidedKg: Math.round((co2DiffGrams / 1000) * 100) / 100,
  };
}
