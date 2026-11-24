export type AirQualityLevel = 'good' | 'moderate' | 'unhealthy-sensitive' | 'unhealthy' | 'severe' | 'hazardous';

export interface HourlyAQIData {
  time: string;           // ISO or HH:mm
  hour: number;           // 0 - 23
  pm25: number;           // µg/m³
  pm10: number;           // µg/m³
  no2: number;            // µg/m³
  usAqi: number;          // 0 - 500+
  europeanAqi: number;    // 0 - 100+
  temperature: number;    // °C
  windSpeed: number;      // km/h
  inversionRisk: 'Low' | 'Moderate' | 'Severe'; // Thermal inversion trapping smog
}

export interface CityPreset {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  regionDescription: string;
  winterSmogCause: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  role: 'Infant' | 'Child' | 'Adult' | 'Elderly' | 'Asthmatic';
  sensitivity: 'extreme' | 'high' | 'moderate' | 'normal';
  ventilationRateLpm: number; // Litres per minute at rest/light exertion
  maskType: 'none' | 'cloth' | 'surgical' | 'n95_ffp2';
  dailyOutdoorMinutes: number;
}

export interface RoutineTask {
  id: string;
  title: string;
  category: 'commute' | 'school' | 'exercise' | 'errand' | 'indoor_chore';
  originalHour: number;
  optimizedHour: number;
  durationMinutes: number;
  originalTransit: 'single_ice_car' | 'two_wheeler' | 'metro_bus' | 'carpool' | 'walk_cycle';
  optimizedTransit: 'single_ice_car' | 'two_wheeler' | 'metro_bus' | 'carpool' | 'walk_cycle';
  location: 'outdoor' | 'indoor';
  originalExposureUrg: number;
  optimizedExposureUrg: number;
  pmAvoidedGrams: number;
  co2AvoidedKg: number;
  rationale: string;
}

export interface CorsiRosenthalConfig {
  fanType: 'box_fan_20in' | 'pc_fan_array' | 'inline_duct_fan';
  fanSpeedCfm: number;
  filterRating: 'MERV13' | 'MERV14' | 'HEPA';
  filterCount: 4 | 5; // 4-filter box or 5-filter Comparetto cube
  filterThicknessInches: 1 | 2;
  roomAreaSqM: number;
  roomCeilingHeightM: number;
  roomType: 'bedroom' | 'living_room' | 'classroom';
}

export interface CorsiRosenthalMetrics {
  totalAirflowCfm: number;
  cadrCubicMetersPerHour: number;
  ach: number; // Air Changes per Hour
  achRating: 'Insufficient' | 'Good' | 'Optimal (Hospital/CDC Grade)';
  diyEstimatedCostUsd: number;
  commercialEquivalentCostUsd: number;
  moneySavedUsd: number;
  noiseLevelDb: number;
}

export interface CommunityPledge {
  id: string;
  neighborhood: string;
  actionTitle: string;
  category: 'anti_idling' | 'carpool' | 'biomass_ban' | 'diy_purifier_workshop';
  participantsCount: number;
  pm25AvoidedKgTotal: number;
  co2AvoidedKgTotal: number;
  timestamp: string;
}

export interface AirQualitySnapshot {
  city: string;
  country: string;
  currentAqi: number;
  currentPm25: number;
  currentPm10: number;
  currentNo2: number;
  level: AirQualityLevel;
  dominantPollutant: string;
  temperature: number;
  windSpeed: number;
  hourly: HourlyAQIData[];
  goldenDispersionWindow: {
    startHour: number;
    endHour: number;
    averageAqi: number;
    reason: string;
  };
}
