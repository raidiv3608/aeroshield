import { describe, it, expect } from 'vitest';
import { runMultiAgentUrbanDefense, DEFAULT_FAMILY_MEMBERS } from './agentOrchestrator';
import { generateFallbackAirQuality } from '../services/airQualityService';
import { CorsiRosenthalConfig } from '../types/airQuality';

describe('Multi-Agent Urban Air Defense Orchestrator', () => {
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

  it('orchestrates reasoning across all 5 agents and produces quantified reductions', () => {
    const result = runMultiAgentUrbanDefense(snapshot, DEFAULT_FAMILY_MEMBERS, crConfig);

    expect(result.aeroSenseSummary).toContain('AeroSense');
    expect(result.familyDosageComparison.baselineTotalUrg).toBeGreaterThan(0);
    expect(result.familyDosageComparison.optimizedTotalUrg).toBeLessThan(result.familyDosageComparison.baselineTotalUrg);
    expect(result.familyDosageComparison.reductionPercentage).toBeGreaterThan(20);
    expect(result.optimizedRoutineTasks.length).toBeGreaterThanOrEqual(4);
    expect(result.indoorAirRecommendations.cookingAndHeatingHacks.length).toBeGreaterThan(0);
    expect(result.impactSpeech).toContain('cigarettes');
  });
});
