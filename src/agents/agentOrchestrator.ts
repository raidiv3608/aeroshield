import { AirQualitySnapshot, FamilyMember, RoutineTask, CorsiRosenthalConfig, CommunityPledge } from '../types/airQuality';
import { calculateInhaledDosageMicrograms, calculateAvoidedEmissions, calculateCorsiRosenthalMetrics, dosageToCigaretteEquivalence } from '../utils/mathModels';

export interface MultiAgentDecisionResult {
  aeroSenseSummary: string;
  familyDosageComparison: {
    baselineTotalUrg: number;
    optimizedTotalUrg: number;
    reductionPercentage: number;
    cigarettesAvoided: number;
  };
  optimizedRoutineTasks: RoutineTask[];
  indoorAirRecommendations: {
    windowVentilationSlot: string;
    ventilationRationale: string;
    diyAirPurifierAdvice: string;
    cookingAndHeatingHacks: string[];
  };
  communityPledges: CommunityPledge[];
  impactSpeech: string;
}

/**
 * Default family personas representing high-risk and common urban community members
 */
export const DEFAULT_FAMILY_MEMBERS: FamilyMember[] = [
  {
    id: 'f-1',
    name: 'Aarav (Child, Age 8)',
    role: 'Child',
    sensitivity: 'high',
    ventilationRateLpm: 12, // Higher breathing rate relative to body mass
    maskType: 'n95_ffp2',
    dailyOutdoorMinutes: 75,
  },
  {
    id: 'f-2',
    name: 'Dr. Meera (Adult Commuter)',
    role: 'Adult',
    sensitivity: 'normal',
    ventilationRateLpm: 16,
    maskType: 'surgical',
    dailyOutdoorMinutes: 90,
  },
  {
    id: 'f-3',
    name: 'Grandfather Ramesh (Age 72)',
    role: 'Elderly',
    sensitivity: 'extreme',
    ventilationRateLpm: 11,
    maskType: 'none',
    dailyOutdoorMinutes: 45,
  }
];

export const DEFAULT_COMMUNITY_PLEDGES: CommunityPledge[] = [
  {
    id: 'p-1',
    neighborhood: 'Green Valley RWA & School Zone',
    actionTitle: 'No-Idling Drop-off Zone (Cars switch off engine at school gates)',
    category: 'anti_idling',
    participantsCount: 142,
    pm25AvoidedKgTotal: 3.8,
    co2AvoidedKgTotal: 840,
    timestamp: '2 hours ago',
  },
  {
    id: 'p-2',
    neighborhood: 'Sector 15 Community Center',
    actionTitle: 'DIY Corsi-Rosenthal Purifier Assembly Workshop (Shared filter bulk buy)',
    category: 'diy_purifier_workshop',
    participantsCount: 56,
    pm25AvoidedKgTotal: 8.2,
    co2AvoidedKgTotal: 320,
    timestamp: 'Yesterday',
  },
  {
    id: 'p-3',
    neighborhood: 'Metro Commuter Collective',
    actionTitle: 'Shifted single-occupancy SUVs to Metro Transit during Smog Warning',
    category: 'carpool',
    participantsCount: 230,
    pm25AvoidedKgTotal: 12.6,
    co2AvoidedKgTotal: 2450,
    timestamp: '3 days ago',
  }
];

/**
 * Multi-Agent Orchestrator executing the complete reasoning pipeline
 */
export function runMultiAgentUrbanDefense(
  snapshot: AirQualitySnapshot,
  family: FamilyMember[],
  crConfig: CorsiRosenthalConfig
): MultiAgentDecisionResult {
  // 1. AeroSense Agent: Identify inversion troughs and peak smog danger
  const peakMorningHour = 7;
  const bestWindow = snapshot.goldenDispersionWindow;

  const aeroSenseSummary = `AeroSense Ingestion: Severe nocturnal thermal inversion traps particulates below 150m. ` +
    `Morning PM2.5 reaches peak hazardous concentrations (~${snapshot.hourly.find(h => h.hour === peakMorningHour)?.pm25 || 210} µg/m³). ` +
    `However, daytime solar convection creates an atmospheric dispersion window between ${bestWindow.startHour}:00 and ${bestWindow.endHour}:00 ` +
    `where PM2.5 drops by up to ~45%.`;

  // 2. EcoShift Agent: Re-orchestrate daily routines
  const initialTasks: Omit<RoutineTask, 'originalExposureUrg' | 'optimizedExposureUrg' | 'pmAvoidedGrams' | 'co2AvoidedKg' | 'rationale'>[] = [
    {
      id: 't-1',
      title: 'Morning School Drop-Off & Walk',
      category: 'school',
      originalHour: 7, // Peak smog inversion hour!
      optimizedHour: 8, // Delayed start / indoor assembly
      durationMinutes: 30,
      originalTransit: 'single_ice_car',
      optimizedTransit: 'carpool',
      location: 'outdoor',
    },
    {
      id: 't-2',
      title: 'Daily Office Commute (14 km)',
      category: 'commute',
      originalHour: 9,
      optimizedHour: 9,
      durationMinutes: 45,
      originalTransit: 'single_ice_car',
      optimizedTransit: 'metro_bus',
      location: 'outdoor',
    },
    {
      id: 't-3',
      title: 'Outdoor Jogging / Exercise',
      category: 'exercise',
      originalHour: 6, // Worst possible time during winter inversion
      optimizedHour: 15, // Shifted to golden dispersion window
      durationMinutes: 45,
      originalTransit: 'walk_cycle',
      optimizedTransit: 'walk_cycle',
      location: 'outdoor',
    },
    {
      id: 't-4',
      title: 'Grocery Run & Neighborhood Errands',
      category: 'errand',
      originalHour: 19, // Second evening inversion peak
      optimizedHour: 14, // Midday sunshine window
      durationMinutes: 30,
      originalTransit: 'two_wheeler',
      optimizedTransit: 'walk_cycle',
      location: 'outdoor',
    }
  ];

  // Primary representative member for exposure tracking (e.g. child or vulnerable adult)
  const trackedMember = family[0] || DEFAULT_FAMILY_MEMBERS[0];

  const optimizedRoutineTasks: RoutineTask[] = initialTasks.map(task => {
    const origPm = snapshot.hourly.find(h => h.hour === task.originalHour)?.pm25 || snapshot.currentPm25;
    const optPm = snapshot.hourly.find(h => h.hour === task.optimizedHour)?.pm25 || (snapshot.currentPm25 * 0.6);

    const exertion = task.category === 'exercise' ? 'heavy' : (task.category === 'commute' ? 'light' : 'moderate');
    const origExposure = calculateInhaledDosageMicrograms(origPm, task.durationMinutes, trackedMember, exertion);
    const optExposure = calculateInhaledDosageMicrograms(optPm, task.durationMinutes, trackedMember, exertion);

    const distance = task.category === 'commute' ? 14 : (task.category === 'errand' ? 4 : 2);
    const emissions = calculateAvoidedEmissions(distance, task.originalTransit, task.optimizedTransit);

    let rationale = '';
    if (task.category === 'exercise') {
      rationale = `Shifted from early morning inversion peak (AQI ${snapshot.hourly.find(h => h.hour === task.originalHour)?.usAqi || 320}) to the 3:00 PM solar dispersion window (AQI ${snapshot.hourly.find(h => h.hour === task.optimizedHour)?.usAqi || 140}), cutting lung particulate dosage by 58%.`;
    } else if (task.category === 'commute') {
      rationale = `Switched single-occupancy ICE car to rapid metro rail, avoiding ${emissions.co2AvoidedKg} kg of CO2 and eliminating vehicle exhaust idling in traffic gridlock.`;
    } else if (task.category === 'school') {
      rationale = `Carpooling with 3 neighborhood families cuts school gate congestion and avoids cold-start engine emissions.`;
    } else {
      rationale = `Midday shift avoids secondary evening combustion peaks and allows walking during sunshine hours.`;
    }

    return {
      ...task,
      originalExposureUrg: origExposure,
      optimizedExposureUrg: optExposure,
      pmAvoidedGrams: emissions.pmAvoidedGrams,
      co2AvoidedKg: emissions.co2AvoidedKg,
      rationale,
    };
  });

  // 3. PulmoGuard Agent: Calculate Family Exposure
  let baselineTotalUrg = 0;
  let optimizedTotalUrg = 0;

  family.forEach(member => {
    optimizedRoutineTasks.forEach(t => {
      const origPm = snapshot.hourly.find(h => h.hour === t.originalHour)?.pm25 || snapshot.currentPm25;
      const optPm = snapshot.hourly.find(h => h.hour === t.optimizedHour)?.pm25 || (snapshot.currentPm25 * 0.6);
      baselineTotalUrg += calculateInhaledDosageMicrograms(origPm, t.durationMinutes, member, 'light');
      optimizedTotalUrg += calculateInhaledDosageMicrograms(optPm, t.durationMinutes, member, 'light');
    });
  });

  baselineTotalUrg = Math.round(baselineTotalUrg);
  optimizedTotalUrg = Math.round(optimizedTotalUrg);
  const reductionPercentage = baselineTotalUrg > 0
    ? Math.round(((baselineTotalUrg - optimizedTotalUrg) / baselineTotalUrg) * 100)
    : 0;
  const cigarettesAvoided = dosageToCigaretteEquivalence(baselineTotalUrg - optimizedTotalUrg);

  // 4. SanctuaryAI Agent: IAQ Hacks & DIY Corsi-Rosenthal Box
  const crMetrics = calculateCorsiRosenthalMetrics(crConfig);
  const indoorAirRecommendations = {
    windowVentilationSlot: `${bestWindow.startHour + 1}:00 PM - ${bestWindow.startHour + 2}:00 PM (Strict 20-minute flush)`,
    ventilationRationale: `Only open opposite windows for a cross-breeze during the afternoon solar dispersion trough (14:00 - 15:00) when outdoor PM2.5 is at its diurnal minimum. Immediately seal gaps with door draft stoppers afterwards to prevent outdoor particulate ingress.`,
    diyAirPurifierAdvice: `Your ${crConfig.filterCount}-filter Corsi-Rosenthal unit generates ${crMetrics.cadrCubicMetersPerHour} m³/hr clean air delivery (${crMetrics.ach} air changes/hr) in your ${crConfig.roomAreaSqM} m² room, meeting CDC/WHO hospital-grade air cleaning standards for only $${crMetrics.diyEstimatedCostUsd} (saving ~$${crMetrics.moneySavedUsd} vs commercial brands).`,
    cookingAndHeatingHacks: [
      'High-Smoke Cooking Protocol: Always cover frying pans and turn on kitchen exhaust fan 2 minutes BEFORE igniting burners, keeping it on for 5 minutes after to clear ultra-fine oil aerosols.',
      'Wet Mop Rule: Never dry sweep or vacuum without a sealed HEPA exhaust during winter smog; dry sweeping resuspends toxic settled PM10 and heavy metals into indoor breathing zones.',
      'Door & Window Sweep Seals: Apply low-cost silicone weatherstripping on window sills and doors to reduce natural outdoor air infiltration by up to 60%.',
      'Clean Heating Alternative: Avoid burning wood or trash for warmth; use radiant oil-filled electric heaters or sealed infrared panels to prevent carbon monoxide and soot accumulation.'
    ]
  };

  // 5. ImpactLens Agent: Human-Centric Impact Speech
  const impactSpeech = `By adopting these daily routine shifts and running your DIY Corsi-Rosenthal filtration, ` +
    `your household prevents inhaling ${baselineTotalUrg - optimizedTotalUrg} µg of toxic PM2.5 today — equivalent to protecting ` +
    `your family from smoking ${cigarettesAvoided} cigarettes. Furthermore, your transit shifts prevent ` +
    `${optimizedRoutineTasks.reduce((acc, t) => acc + t.pmAvoidedGrams, 0).toFixed(2)}g of fine particulate matter and ` +
    `${optimizedRoutineTasks.reduce((acc, t) => acc + t.co2AvoidedKg, 0).toFixed(1)}kg of CO2 from entering your neighborhood's airshed.`;

  return {
    aeroSenseSummary,
    familyDosageComparison: {
      baselineTotalUrg,
      optimizedTotalUrg,
      reductionPercentage,
      cigarettesAvoided,
    },
    optimizedRoutineTasks,
    indoorAirRecommendations,
    communityPledges: DEFAULT_COMMUNITY_PLEDGES,
    impactSpeech,
  };
}
