import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Header } from './Header';
import { CorsiRosenthalStudio } from './CorsiRosenthalStudio';
import { FamilyVulnerabilityCard } from './FamilyVulnerabilityCard';
import { IndoorHacksCard } from './IndoorHacksCard';
import { CommunityShieldCard } from './CommunityShieldCard';
import { AgentExplainer } from './AgentExplainer';
import { ErrorBoundary } from './ErrorBoundary';
import { DEFAULT_FAMILY_MEMBERS, DEFAULT_COMMUNITY_PLEDGES, runMultiAgentUrbanDefense } from '../agents/agentOrchestrator';
import { generateFallbackAirQuality } from '../services/airQualityService';

describe('Accessibility & UI Landmark Verification (WCAG 2.1 AA)', () => {
  const snapshot = generateFallbackAirQuality('New Delhi', 'India');
  const decision = runMultiAgentUrbanDefense(snapshot, DEFAULT_FAMILY_MEMBERS, {
    fanType: 'box_fan_20in',
    fanSpeedCfm: 550,
    filterRating: 'MERV13',
    filterCount: 4,
    filterThicknessInches: 2,
    roomAreaSqM: 25,
    roomCeilingHeightM: 2.7,
    roomType: 'living_room',
  });

  describe('Header Component Accessibility', () => {
    it('renders with banner role and accessible search label', () => {
      render(
        <Header
          currentCity="New Delhi"
          currentCountry="India"
          onSelectCity={vi.fn()}
          onSearchQuery={vi.fn()}
          isAiProcessing={false}
          onTriggerAiRefresh={vi.fn()}
        />
      );

      const banner = screen.getByRole('banner');
      expect(banner).toBeDefined();

      const searchInput = screen.getByRole('searchbox');
      expect(searchInput).toBeDefined();
      expect(searchInput.getAttribute('id')).toBe('city-search-input');

      const searchLabel = screen.getByLabelText(/search any global city/i);
      expect(searchLabel).toBeDefined();

      const presetsButton = screen.getByRole('button', { name: /current city/i });
      expect(presetsButton.getAttribute('aria-haspopup')).toBe('listbox');
      expect(presetsButton.getAttribute('aria-expanded')).toBe('false');
    });
  });

  describe('CorsiRosenthalStudio Accessibility', () => {
    it('has explicit labels and aria attributes for range sliders', () => {
      render(<CorsiRosenthalStudio />);

      const region = screen.getByRole('region', { name: /sanctuaryai/i });
      expect(region).toBeDefined();

      // Sliders
      const areaSlider = screen.getByLabelText(/room floor area/i);
      expect(areaSlider).toBeDefined();
      expect(areaSlider.getAttribute('aria-valuemin')).toBe('10');
      expect(areaSlider.getAttribute('aria-valuemax')).toBe('80');
      expect(areaSlider.getAttribute('aria-valuenow')).toBe('25');

      const heightSlider = screen.getByLabelText(/ceiling height/i);
      expect(heightSlider).toBeDefined();
      expect(heightSlider.getAttribute('aria-valuemin')).toBe('2.2');
      expect(heightSlider.getAttribute('aria-valuenow')).toBe('2.7');

      // Radiogroup
      const radioGroup = screen.getByRole('radiogroup', { name: /box purifier configuration/i });
      expect(radioGroup).toBeDefined();
    });
  });

  describe('FamilyVulnerabilityCard Accessibility', () => {
    it('provides accessible select dropdowns for respiratory protection for every family member', () => {
      render(
        <FamilyVulnerabilityCard
          family={DEFAULT_FAMILY_MEMBERS}
          onUpdateMask={vi.fn()}
          baselineTotalUrg={180}
          optimizedTotalUrg={72}
        />
      );

      const region = screen.getByRole('region', { name: /pulmoguard/i });
      expect(region).toBeDefined();

      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBe(DEFAULT_FAMILY_MEMBERS.length);
      selects.forEach(select => {
        expect(select.getAttribute('id')).toMatch(/^mask-select-/);
      });
    });
  });

  describe('IndoorHacksCard Accessibility', () => {
    it('renders with region role and proper heading structure', () => {
      render(
        <IndoorHacksCard
          windowVentilationSlot={decision.indoorAirRecommendations.windowVentilationSlot}
          ventilationRationale={decision.indoorAirRecommendations.ventilationRationale}
          cookingAndHeatingHacks={decision.indoorAirRecommendations.cookingAndHeatingHacks}
        />
      );

      const region = screen.getByRole('region', { name: /smart indoor air quality/i });
      expect(region).toBeDefined();
    });
  });

  describe('CommunityShieldCard Accessibility', () => {
    it('provides accessible action button and pledge cards', () => {
      render(<CommunityShieldCard pledges={DEFAULT_COMMUNITY_PLEDGES} />);

      const region = screen.getByRole('region', { name: /communityshield/i });
      expect(region).toBeDefined();

      const pledgeButton = screen.getByRole('button', { name: /sign neighborhood clean air smog pledge/i });
      expect(pledgeButton).toBeDefined();
    });
  });

  describe('AgentExplainer Accessibility', () => {
    it('provides transparent scientific justification landmark', () => {
      render(<AgentExplainer decision={decision} />);

      const region = screen.getByRole('region', { name: /impactlens/i });
      expect(region).toBeDefined();
    });
  });

  describe('ErrorBoundary Component Robustness', () => {
    it('catches render errors and renders accessible error fallback UI', () => {
      const ProblemChild = () => {
        throw new Error('Simulated component crash');
      };

      // Suppress console.error in test output for clean logs
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ProblemChild />
        </ErrorBoundary>
      );

      const alert = screen.getByRole('alert');
      expect(alert).toBeDefined();
      expect(screen.getByText(/application exception caught/i)).toBeDefined();
      expect(screen.getByRole('button', { name: /reload application/i })).toBeDefined();

      spy.mockRestore();
    });
  });
});
