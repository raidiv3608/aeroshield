import { describe, it, expect } from 'vitest';
import { runMultiAgentUrbanDefense, DEFAULT_FAMILY_MEMBERS, DEFAULT_COMMUNITY_PLEDGES } from './agentOrchestrator';
import { generateFallbackAirQuality } from '../services/airQualityService';
import { CorsiRosenthalConfig, FamilyMember } from '../types/airQuality';

describe('agentOrchestrator — Multi-Agent Deliberation Pipeline', () => {
  const snapshot = generateFallbackAirQuality('New Delhi', 'India');
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

  it('orchestrates reasoning across all agents and outputs non-empty decision results', () => {
    const result = runMultiAgentUrbanDefense(snapshot, DEFAULT_FAMILY_MEMBERS, crConfig);

    expect(result.aeroSenseSummary).toBeDefined();
    expect(result.familyDosageComparison).toBeDefined();
    expect(result.optimizedRoutineTasks).toBeDefined();
    expect(result.indoorAirRecommendations).toBeDefined();
    expect(result.communityPledges).toBeDefined();
    expect(result.impactSpeech).toBeDefined();
  });

  it('AeroSense Agent: detects diurnal boundary-layer atmospheric dispersion window', () => {
    const result = runMultiAgentUrbanDefense(snapshot, DEFAULT_FAMILY_MEMBERS, crConfig);
    expect(result.aeroSenseSummary).toContain('AeroSense');
    expect(result.aeroSenseSummary).toContain('inversion');
    expect(result.aeroSenseSummary).toContain('dispersion window');
  });

  it('EcoShift Agent: reschedules high-exertion routines away from morning smog peak', () => {
    const result = runMultiAgentUrbanDefense(snapshot, DEFAULT_FAMILY_MEMBERS, crConfig);
    const exerciseTask = result.optimizedRoutineTasks.find(t => t.category === 'exercise');
    expect(exerciseTask).toBeDefined();
    // Shifted from morning 6:00 AM inversion peak to 15:00 (3:00 PM) dispersion window
    expect(exerciseTask?.originalHour).toBe(6);
    expect(exerciseTask?.optimizedHour).toBe(15);
    expect(exerciseTask?.optimizedExposureUrg).toBeLessThan(exerciseTask!.originalExposureUrg);
  });

  it('EcoShift Agent: modal shifts car commutes to transit and saves emissions', () => {
    const result = runMultiAgentUrbanDefense(snapshot, DEFAULT_FAMILY_MEMBERS, crConfig);
    const commuteTask = result.optimizedRoutineTasks.find(t => t.category === 'commute');
    expect(commuteTask).toBeDefined();
    expect(commuteTask?.originalTransit).toBe('single_ice_car');
    expect(commuteTask?.optimizedTransit).toBe('metro_bus');
    expect(commuteTask?.co2AvoidedKg).toBeGreaterThan(1.0);
    expect(commuteTask?.pmAvoidedGrams).toBeGreaterThan(0.2);
  });

  it('PulmoGuard Agent: achieves measurable family particulate reduction (>20%)', () => {
    const result = runMultiAgentUrbanDefense(snapshot, DEFAULT_FAMILY_MEMBERS, crConfig);
    const { baselineTotalUrg, optimizedTotalUrg, reductionPercentage, cigarettesAvoided } = result.familyDosageComparison;

    expect(baselineTotalUrg).toBeGreaterThan(0);
    expect(optimizedTotalUrg).toBeLessThan(baselineTotalUrg);
    expect(reductionPercentage).toBeGreaterThanOrEqual(20);
    expect(cigarettesAvoided).toBeGreaterThanOrEqual(0);
  });

  it('SanctuaryAI Agent: provides CADR advice and non-empty indoor hacks', () => {
    const result = runMultiAgentUrbanDefense(snapshot, DEFAULT_FAMILY_MEMBERS, crConfig);
    const { windowVentilationSlot, ventilationRationale, diyAirPurifierAdvice, cookingAndHeatingHacks } = result.indoorAirRecommendations;

    expect(windowVentilationSlot).toContain('PM');
    expect(ventilationRationale.length).toBeGreaterThan(20);
    expect(diyAirPurifierAdvice).toContain('Corsi-Rosenthal');
    expect(cookingAndHeatingHacks.length).toBeGreaterThanOrEqual(4);
    // Verifies scientifically validated IAQ advice
    expect(cookingAndHeatingHacks.some(h => h.includes('Wet Mop'))).toBe(true);
    expect(cookingAndHeatingHacks.some(h => h.toLowerCase().includes('exhaust'))).toBe(true);
  });

  it('CommunityShield Agent: returns valid community pledges and collective metrics', () => {
    const result = runMultiAgentUrbanDefense(snapshot, DEFAULT_FAMILY_MEMBERS, crConfig);
    expect(result.communityPledges.length).toBeGreaterThanOrEqual(3);
    const totalPledges = result.communityPledges.reduce((acc, p) => acc + p.participantsCount, 0);
    expect(totalPledges).toBeGreaterThan(100);
  });

  it('ImpactLens Agent: formulates clear, empowering narrative text', () => {
    const result = runMultiAgentUrbanDefense(snapshot, DEFAULT_FAMILY_MEMBERS, crConfig);
    expect(result.impactSpeech).toContain('Corsi-Rosenthal');
    expect(result.impactSpeech).toContain('cigarettes');
    expect(result.impactSpeech).toContain('CO2');
  });

  it('handles empty family array gracefully with fallback', () => {
    const result = runMultiAgentUrbanDefense(snapshot, [], crConfig);
    expect(result.optimizedRoutineTasks.length).toBeGreaterThan(0);
    expect(result.familyDosageComparison.baselineTotalUrg).toBeGreaterThan(0);
  });

  it('adapts when a family member has asthma or extreme sensitivity', () => {
    const asthmaticFamily: FamilyMember[] = [
      {
        id: 'f-asthma',
        name: 'Asthmatic Child',
        role: 'Asthmatic',
        sensitivity: 'extreme',
        ventilationRateLpm: 14,
        maskType: 'n95_ffp2',
        dailyOutdoorMinutes: 45,
      }
    ];

    const result = runMultiAgentUrbanDefense(snapshot, asthmaticFamily, crConfig);
    expect(result.familyDosageComparison.optimizedTotalUrg).toBeLessThan(result.familyDosageComparison.baselineTotalUrg);
  });
});
