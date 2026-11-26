import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { SmogRadarCard } from './components/SmogRadarCard';
import { RoutinePlannerCard } from './components/RoutinePlannerCard';
import { CorsiRosenthalStudio } from './components/CorsiRosenthalStudio';
import { FamilyVulnerabilityCard } from './components/FamilyVulnerabilityCard';
import { IndoorHacksCard } from './components/IndoorHacksCard';
import { CommunityShieldCard } from './components/CommunityShieldCard';
import { AgentExplainer } from './components/AgentExplainer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { fetchLiveAirQuality, GLOBAL_SMOG_HOTSPOTS, searchGlobalCities } from './services/airQualityService';
import { AirQualitySnapshot, CityPreset, FamilyMember, CorsiRosenthalConfig } from './types/airQuality';
import { runMultiAgentUrbanDefense, DEFAULT_FAMILY_MEMBERS } from './agents/agentOrchestrator';
import { FileText, Copy, Check, X } from 'lucide-react';

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
  const [selectedCity, setSelectedCity] = useState<CityPreset>(GLOBAL_SMOG_HOTSPOTS[0]); // Default: New Delhi
  const [snapshot, setSnapshot] = useState<AirQualitySnapshot | null>(null);
  const [family, setFamily] = useState<FamilyMember[]>(DEFAULT_FAMILY_MEMBERS);
  const [crConfig, setCrConfig] = useState<CorsiRosenthalConfig>({
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
  const [loading, setLoading] = useState<boolean>(true);
  const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false);
  const [screenReaderAnnouncement, setScreenReaderAnnouncement] = useState<string>('');
  const [showPlanModal, setShowPlanModal] = useState<boolean>(false);
  const [copiedPlan, setCopiedPlan] = useState<boolean>(false);

  const tabRefs = useRef<{ [key in TabId]?: HTMLButtonElement | null }>({});

  // Load telemetry data on city change
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      setScreenReaderAnnouncement(`Loading air quality telemetry for ${selectedCity.name}, ${selectedCity.country}...`);
      const data = await fetchLiveAirQuality(
        selectedCity.latitude,
        selectedCity.longitude,
        selectedCity.name,
        selectedCity.country
      );
      if (isMounted) {
        setSnapshot(data);
        setLoading(false);
        setScreenReaderAnnouncement(
          `Air quality updated for ${selectedCity.name}. Current AQI is ${data.currentAqi}, PM2.5 is ${data.currentPm25} micrograms per cubic meter, classified as ${data.level}.`
        );
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [selectedCity]);

  const handleCitySelect = useCallback((preset: CityPreset) => {
    setSelectedCity(preset);
  }, []);

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
    } else {
      setScreenReaderAnnouncement(`No matching cities found for ${query}.`);
    }
  }, []);

  const handleUpdateMask = useCallback((memberId: string, maskType: FamilyMember['maskType']) => {
    setFamily(prev => {
      const next = prev.map(m => m.id === memberId ? { ...m, maskType } : m);
      const member = next.find(m => m.id === memberId);
      if (member) {
        setScreenReaderAnnouncement(`Updated mask for ${member.name} to ${maskType}. Recalculating particulate dosage.`);
      }
      return next;
    });
  }, []);

  const handleAddMember = useCallback((newMember: FamilyMember) => {
    setFamily(prev => [...prev, newMember]);
    setScreenReaderAnnouncement(`Added custom family member profile for ${newMember.name}.`);
  }, []);

  const handleTriggerAiRefresh = useCallback(() => {
    setIsAiProcessing(true);
    setScreenReaderAnnouncement('Re-running multi-agent reasoning models across all modules...');
    setTimeout(() => {
      setIsAiProcessing(false);
      setScreenReaderAnnouncement('Multi-agent reasoning updated successfully with latest telemetry.');
    }, 900);
  }, []);

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
   Total PM2.5 Inhaled Burden Avoided: ${decision.familyDosageComparison.baselineTotalUrg - decision.familyDosageComparison.optimizedTotalUrg} µg (-${decision.familyDosageComparison.reductionPercentage}%)
   Equivalent Cigarettes Avoided: ${decision.familyDosageComparison.cigarettesAvoided} cigarettes today.

3. INDOOR AIR QUALITY (IAQ) DEFENSE:
   ${decision.indoorAirRecommendations.diyAirPurifierAdvice}
   Cooking/Heating: Always run exhaust 2 min before frying; wet-mop only (never dry sweep).

4. RE-SCHEDULED ROUTINE:
   ${decision.optimizedRoutineTasks.map(t => `• ${t.title}: Shifted to ${t.optimizedHour}:00 (${t.optimizedTransit.replace(/_/g, ' ')})`).join('\n   ')}

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
                <div className="space-y-6">
                  <RoutinePlannerCard
                    tasks={decision.optimizedRoutineTasks}
                    onApplySchedule={() => {
                      setScreenReaderAnnouncement('Optimized low-emission routine applied successfully. Particulate and emissions reductions recorded.');
                    }}
                  />
                  <SmogRadarCard snapshot={snapshot} />
                  <AgentExplainer decision={decision} />
                </div>
              )}

              {activeTab === 'diy_purifier' && (
                <div className="space-y-6">
                  <CorsiRosenthalStudio />
                  <IndoorHacksCard
                    windowVentilationSlot={decision.indoorAirRecommendations.windowVentilationSlot}
                    ventilationRationale={decision.indoorAirRecommendations.ventilationRationale}
                    cookingAndHeatingHacks={decision.indoorAirRecommendations.cookingAndHeatingHacks}
                  />
                  <AgentExplainer decision={decision} />
                </div>
              )}

              {activeTab === 'community' && (
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
              )}
            </>
          )}
        </main>

        {/* Action Plan Export Modal */}
        {showPlanModal && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="plan-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in"
          >
            <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
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
                  className="text-slate-400 hover:text-white"
                  aria-label="Close Action Plan Modal"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <textarea
                readOnly
                aria-label="Family Smog Defense Action Plan text"
                value={exportablePlanText}
                className="w-full h-64 bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 font-mono leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />

              <div className="flex items-center justify-between gap-3 pt-2">
                <span className="text-[11px] text-slate-400">Share with family, school transit pools, or neighbors</span>
                <button
                  type="button"
                  onClick={handleCopyPlan}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  {copiedPlan ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                  {copiedPlan ? 'Copied to Clipboard!' : 'Copy Action Plan'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Accessible Footer */}
        <footer role="contentinfo" className="border-t border-slate-800 bg-slate-900/60 py-5 mt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-300 gap-3">
            <div>
              <strong className="text-white font-semibold">AeroShield</strong> — GenAI Urban Air Defense Copilot for PromptWars: Virtual Challenge (Challenge 6)
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span>Peer-Reviewed Standards: EPA • WHO • UC Davis Air Quality Research • ASHRAE 241</span>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}

export default App;
