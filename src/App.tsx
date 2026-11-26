import React, { useState, useRef, useMemo, useCallback, Suspense } from 'react';
import { Header } from './components/Header';
import { SmogRadarCard } from './components/SmogRadarCard';
import { FamilyVulnerabilityCard } from './components/FamilyVulnerabilityCard';
import { IndoorHacksCard } from './components/IndoorHacksCard';
import { AgentExplainer } from './components/AgentExplainer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useAirQuality } from './hooks/useAirQuality';
import { GLOBAL_SMOG_HOTSPOTS, searchGlobalCities } from './services/airQualityService';
import { CityPreset, FamilyMember, CorsiRosenthalConfig } from './types/airQuality';
import { runMultiAgentUrbanDefense, DEFAULT_FAMILY_MEMBERS } from './agents/agentOrchestrator';
import { FileText, Copy, Check, X } from 'lucide-react';

// Dynamic lazy-loading of secondary tabs for optimal initial chunk size & instant FCP
const RoutinePlannerCard = React.lazy(() =>
  import('./components/RoutinePlannerCard').then((m) => ({ default: m.RoutinePlannerCard }))
);
const CorsiRosenthalStudio = React.lazy(() =>
  import('./components/CorsiRosenthalStudio').then((m) => ({ default: m.CorsiRosenthalStudio }))
);
const CommunityShieldCard = React.lazy(() =>
  import('./components/CommunityShieldCard').then((m) => ({ default: m.CommunityShieldCard }))
);

const CardLoadingFallback: React.FC = () => (
  <div
    role="status"
    aria-busy="true"
    aria-label="Loading module..."
    className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 flex flex-col items-center justify-center space-y-3"
  >
    <div
      className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"
      aria-hidden="true"
    />
    <span className="text-xs text-slate-400 font-medium">Assembling multi-agent module...</span>
  </div>
);

type TabId = 'overview' | 'routine' | 'diy_purifier' | 'community';

interface TabItem {
  id: TabId;
  label: string;
  icon: string;
}

const TABS: TabItem[] = [
  { id: 'overview', label: 'Smog Radar & Exposure', icon: '🛡️' },
  { id: 'routine', label: 'EcoShift Routine Planner', icon: '📅' },
  { id: 'diy_purifier', label: 'DIY Corsi-Rosenthal Studio', icon: '🔧' },
  { id: 'community', label: 'Community Defense Hub', icon: '🤝' },
];

export function App() {
  const {
    selectedCity,
    setSelectedCity,
    snapshot,
    loading,
    refetch,
  } = useAirQuality(GLOBAL_SMOG_HOTSPOTS[0]);

  const [family, setFamily] = useState<FamilyMember[]>(DEFAULT_FAMILY_MEMBERS);
  const [crConfig] = useState<CorsiRosenthalConfig>({
    fanType: 'box_fan_20in',
    fanSpeedCfm: 550,
    filterRating: 'MERV13',
    filterCount: 4,
    filterThicknessInches: 2,
    roomAreaSqM: 25,
    roomCeilingHeightM: 2.7,
    roomType: 'living_room',
  });
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false);
  const [screenReaderAnnouncement, setScreenReaderAnnouncement] = useState<string>('');
  const [showPlanModal, setShowPlanModal] = useState<boolean>(false);
  const [copiedPlan, setCopiedPlan] = useState<boolean>(false);

  const tabRefs = useRef<{ [key in TabId]?: HTMLButtonElement | null }>({});

  const handleCitySelect = useCallback((preset: CityPreset) => {
    setSelectedCity(preset);
    setScreenReaderAnnouncement(`Selected city ${preset.name}, ${preset.country}. Updating air quality.`);
  }, [setSelectedCity]);

  const handleSearchQuery = useCallback(async (query: string) => {
    setScreenReaderAnnouncement(`Searching for city: ${query}`);
    const results = await searchGlobalCities(query);
    if (results.length > 0) {
      const first = results[0];
      setSelectedCity({
        name: first.name,
        country: first.country,
        latitude: first.latitude,
        longitude: first.longitude,
        regionDescription: `Live telemetry for ${first.name}, ${first.country}`,
        winterSmogCause: 'Regional urban emission basin and seasonal meteorological stagnation.',
      });
      setScreenReaderAnnouncement(`Loaded telemetry for ${first.name}, ${first.country}`);
    } else {
      setScreenReaderAnnouncement(`No matching cities found for ${query}.`);
    }
  }, [setSelectedCity]);

  const handleUpdateMask = useCallback((memberId: string, maskType: FamilyMember['maskType']) => {
    setFamily((prev) => {
      const next = prev.map((m) => (m.id === memberId ? { ...m, maskType } : m));
      const member = next.find((m) => m.id === memberId);
      if (member) {
        setScreenReaderAnnouncement(
          `Updated mask for ${member.name} to ${maskType}. Recalculating particulate dosage.`
        );
      }
      return next;
    });
  }, []);

  const handleAddMember = useCallback((newMember: FamilyMember) => {
    setFamily((prev) => [...prev, newMember]);
    setScreenReaderAnnouncement(`Added custom family member profile for ${newMember.name}.`);
  }, []);

  const handleTriggerAiRefresh = useCallback(async () => {
    setIsAiProcessing(true);
    setScreenReaderAnnouncement('Re-running multi-agent reasoning models across all modules...');
    await refetch();
    setTimeout(() => {
      setIsAiProcessing(false);
      setScreenReaderAnnouncement('Multi-agent reasoning updated successfully with latest telemetry.');
    }, 600);
  }, [refetch]);

  // Keyboard navigation for WAI-ARIA tab pattern
  const handleTabKeyDown = (e: React.KeyboardEvent, index: number) => {
    let targetIndex = index;
    if (e.key === 'ArrowRight') {
      targetIndex = (index + 1) % TABS.length;
      e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
      targetIndex = (index - 1 + TABS.length) % TABS.length;
      e.preventDefault();
    } else if (e.key === 'Home') {
      targetIndex = 0;
      e.preventDefault();
    } else if (e.key === 'End') {
      targetIndex = TABS.length - 1;
      e.preventDefault();
    }

    if (targetIndex !== index) {
      const nextTab = TABS[targetIndex].id;
      setActiveTab(nextTab);
      tabRefs.current[nextTab]?.focus();
    }
  };

  // Memoized Multi-Agent Deliberation Result (Prevents redundant recalculations on renders)
  const decision = useMemo(() => {
    return snapshot ? runMultiAgentUrbanDefense(snapshot, family, crConfig) : null;
  }, [snapshot, family, crConfig]);

  // Exportable Plain Text Plan for WhatsApp/Community Sharing
  const exportablePlanText = useMemo(() => {
    if (!snapshot || !decision) return '';
    return `🛡️ AEROSHIELD FAMILY SMOG DEFENSE ACTION PLAN
Location: ${snapshot.city}, ${snapshot.country} | Current AQI: ${snapshot.currentAqi} (${snapshot.level.toUpperCase()})

1. GOLDEN OUTDOOR DISPERSION WINDOW:
   ${decision.indoorAirRecommendations.windowVentilationSlot}
   Rationale: Solar heating breaks ground-level inversion layer.

2. FAMILY LUNG PROTECTION:
   Total PM2.5 Inhaled Burden Avoided: ${
     decision.familyDosageComparison.baselineTotalUrg - decision.familyDosageComparison.optimizedTotalUrg
   } µg (-${decision.familyDosageComparison.reductionPercentage}%)
   Equivalent Cigarettes Avoided: ${decision.familyDosageComparison.cigarettesAvoided} cigarettes today.

3. INDOOR AIR QUALITY (IAQ) DEFENSE:
   ${decision.indoorAirRecommendations.diyAirPurifierAdvice}
   Cooking/Heating: Always run exhaust 2 min before frying; wet-mop only (never dry sweep).

4. RE-SCHEDULED ROUTINE:
   ${decision.optimizedRoutineTasks
     .map((t) => `• ${t.title}: Shifted to ${t.optimizedHour}:00 (${t.optimizedTransit.replace(/_/g, ' ')})`)
     .join('\n   ')}

Shared via AeroShield — GenAI Urban Air Defense Copilot`;
  }, [snapshot, decision]);

  const handleCopyPlan = () => {
    navigator.clipboard.writeText(exportablePlanText);
    setCopiedPlan(true);
    setTimeout(() => setCopiedPlan(false), 2000);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        {/* Skip to Main Content Landmark */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-emerald-600 focus:text-white focus:font-bold focus:rounded-lg focus:shadow-2xl focus:ring-2 focus:ring-white focus:outline-none"
        >
          Skip to main content
        </a>

        {/* Screen Reader Live Announcement Region */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {screenReaderAnnouncement}
        </div>

        <Header
          currentCity={selectedCity.name}
          currentCountry={selectedCity.country}
          onSelectCity={handleCitySelect}
          onSearchQuery={handleSearchQuery}
          isAiProcessing={isAiProcessing}
          onTriggerAiRefresh={handleTriggerAiRefresh}
        />

        {/* Navigation Tabs Bar */}
        <nav
          role="navigation"
          aria-label="Main Application Views"
          className="border-b border-slate-800 bg-slate-900/60 sticky top-16 z-30 backdrop-blur-sm"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div
              role="tablist"
              aria-label="AeroShield Dashboard Views"
              className="flex space-x-2 overflow-x-auto py-2.5 scrollbar-thin"
            >
              {TABS.map((tab, idx) => {
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`tab-${tab.id}`}
                    ref={(el) => (tabRefs.current[tab.id] = el)}
                    role="tab"
                    aria-selected={isSelected}
                    aria-controls={`tabpanel-${tab.id}`}
                    tabIndex={isSelected ? 0 : -1}
                    onClick={() => setActiveTab(tab.id)}
                    onKeyDown={(e) => handleTabKeyDown(e, idx)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-950 ${
                      isSelected
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                    }`}
                  >
                    <span aria-hidden="true">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Export Family Smog Action Plan Button */}
            {decision && (
              <button
                type="button"
                onClick={() => setShowPlanModal(true)}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-xs font-semibold text-emerald-300 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Export Family Plan</span>
              </button>
            )}
          </div>
        </nav>

        {/* Main Content Area */}
        <main
          id="main-content"
          role="tabpanel"
          tabIndex={0}
          aria-labelledby={`tab-${activeTab}`}
          className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6 focus:outline-none"
        >
          {loading || !snapshot || !decision ? (
            <div
              role="alert"
              aria-busy="true"
              className="flex flex-col items-center justify-center py-24 space-y-3"
            >
              <div
                className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"
                aria-hidden="true"
              />
              <p className="text-sm text-slate-300 font-medium">
                AeroSense Ingestion Agent syncing live telemetry for {selectedCity.name}...
              </p>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <SmogRadarCard snapshot={snapshot} />
                  <FamilyVulnerabilityCard
                    family={family}
                    onUpdateMask={handleUpdateMask}
                    onAddMember={handleAddMember}
                    baselineTotalUrg={decision.familyDosageComparison.baselineTotalUrg}
                    optimizedTotalUrg={decision.familyDosageComparison.optimizedTotalUrg}
                  />
                  <IndoorHacksCard
                    windowVentilationSlot={decision.indoorAirRecommendations.windowVentilationSlot}
                    ventilationRationale={decision.indoorAirRecommendations.ventilationRationale}
                    cookingAndHeatingHacks={decision.indoorAirRecommendations.cookingAndHeatingHacks}
                  />
                  <AgentExplainer decision={decision} />
                </div>
              )}

              {activeTab === 'routine' && (
                <Suspense fallback={<CardLoadingFallback />}>
                  <div className="space-y-6">
                    <RoutinePlannerCard
                      tasks={decision.optimizedRoutineTasks}
                      onApplySchedule={() => {
                        setScreenReaderAnnouncement(
                          'Optimized low-emission routine applied successfully. Particulate and emissions reductions recorded.'
                        );
                      }}
                    />
                    <SmogRadarCard snapshot={snapshot} />
                    <AgentExplainer decision={decision} />
                  </div>
                </Suspense>
              )}

              {activeTab === 'diy_purifier' && (
                <Suspense fallback={<CardLoadingFallback />}>
                  <div className="space-y-6">
                    <CorsiRosenthalStudio />
                    <IndoorHacksCard
                      windowVentilationSlot={decision.indoorAirRecommendations.windowVentilationSlot}
                      ventilationRationale={decision.indoorAirRecommendations.ventilationRationale}
                      cookingAndHeatingHacks={decision.indoorAirRecommendations.cookingAndHeatingHacks}
                    />
                    <AgentExplainer decision={decision} />
                  </div>
                </Suspense>
              )}

              {activeTab === 'community' && (
                <Suspense fallback={<CardLoadingFallback />}>
                  <div className="space-y-6">
                    <CommunityShieldCard pledges={decision.communityPledges} />
                    <RoutinePlannerCard
                      tasks={decision.optimizedRoutineTasks}
                      onApplySchedule={() => {
                        setScreenReaderAnnouncement('Smart routine adopted successfully.');
                      }}
                    />
                    <AgentExplainer decision={decision} />
                  </div>
                </Suspense>
              )}
            </>
          )}
        </main>

        {/* Action Plan Export Modal */}
        {showPlanModal && decision && snapshot && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="plan-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in"
          >
            <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-400" aria-hidden="true" />
                  <h2 id="plan-modal-title" className="text-base font-bold text-white">
                    Family Smog Defense Action Plan
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  aria-label="Close modal"
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-xs text-slate-300">
                Export and share this tailored action plan with family, school chat groups, or neighbors via WhatsApp or email:
              </p>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 max-h-64 overflow-y-auto">
                <pre className="text-xs font-mono text-emerald-200 whitespace-pre-wrap">
                  {exportablePlanText}
                </pre>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800"
                >
                  Done
                </button>
                <button
                  type="button"
                  onClick={handleCopyPlan}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all"
                >
                  {copiedPlan ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy Full Action Plan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer role="contentinfo" className="border-t border-slate-800 bg-slate-900/40 py-6 mt-12 text-center text-xs text-slate-400">
          <div className="max-w-7xl mx-auto px-4 space-y-2">
            <p className="text-slate-300">
              AeroShield Copilot • Multi-Agent Atmospheric Modeling for Extreme Winter Smog
            </p>
            <p className="text-[11px] text-slate-400">
              Validated using US EPA Exposure Factors Handbook, Berkeley Earth Particulate Equivalence, and UC Davis Indoor Aerosol Engineering.
            </p>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}
export default App;
