/**
 * Scientific constants and empirical benchmarks derived from
 * EPA Exposure Factors Handbook, WHO Air Quality Guidelines,
 * ASHRAE 241, and UC Davis Aerosol Research.
 */

/** Conversion factor from Cubic Feet per Minute (CFM) to Cubic Meters per Hour (m³/hr) */
export const CFM_TO_M3_PER_HOUR = 1.69901;

/**
 * Berkeley Earth Particulate-to-Cigarette Conversion:
 * Ambient PM2.5 concentration of 22 µg/m³ for 24h exposure is approximately
 * equivalent to smoking 1 cigarette (approx. 200 µg inhaled particulate mass).
 */
export const BERKELEY_EARTH_UG_PER_CIGARETTE = 200;

/** CDC and ASHRAE 241 Infection and Particulate Control Benchmark for clean indoor spaces */
export const CDC_HOSPITAL_ACH_BENCHMARK = 5.0;

/** Good indoor air changes benchmark */
export const GOOD_INDOOR_ACH_BENCHMARK = 3.0;

/** Certified particle filtration efficiencies against fine sub-micron PM2.5 */
export const MASK_FILTRATION_EFFICIENCIES = {
  none: 0.0,
  cloth: 0.30,
  surgical: 0.70,
  n95_ffp2: 0.95,
} as const;

/**
 * Vehicle emission factors derived from EPA and European Environment Agency (EEA):
 * Units: CO2 in grams/km, PM2.5 in grams/km (combustion + tire/brake wear)
 */
export const TRANSIT_EMISSION_FACTORS = {
  single_ice_car: { co2GramsPerKm: 175, pm25GramsPerKm: 0.038 },
  two_wheeler:    { co2GramsPerKm: 80,  pm25GramsPerKm: 0.025 },
  metro_bus:      { co2GramsPerKm: 32,  pm25GramsPerKm: 0.004 },
  carpool:        { co2GramsPerKm: 58,  pm25GramsPerKm: 0.012 },
  walk_cycle:     { co2GramsPerKm: 0,   pm25GramsPerKm: 0.000 },
} as const;

/** Cache TTL for live telemetry in milliseconds (5 minutes) */
export const TELEMETRY_CACHE_TTL_MS = 5 * 60 * 1000;
