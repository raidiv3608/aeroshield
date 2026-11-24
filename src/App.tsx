import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SmogRadarCard } from './components/SmogRadarCard';
import { RoutinePlannerCard } from './components/RoutinePlannerCard';
import { CorsiRosenthalStudio } from './components/CorsiRosenthalStudio';
import { FamilyVulnerabilityCard } from './components/FamilyVulnerabilityCard';
import { IndoorHacksCard } from './components/IndoorHacksCard';
import { CommunityShieldCard } from './components/CommunityShieldCard';
import { AgentExplainer } from './components/AgentExplainer';
import { fetchLiveAirQuality, GLOBAL_SMOG_HOTSPOTS, searchGlobalCities } from './services/airQualityService';
import { AirQualitySnapshot, CityPreset, FamilyMember, CorsiRosenthalConfig } from './types/airQuality';
import { runMultiAgentUrbanDefense, DEFAULT_FAMILY_MEMBERS } from './agents/agentOrchestrator';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'routine' | 'diy_purifier' | 'community'>('overview');
  const [loading, setLoading] = useState<boolean>(true);
  const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false);

  // Load telemetry data on city change
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      const data = await fetchLiveAirQuality(
        selectedCity.latitude,
        selectedCity.longitude,
        selectedCity.name,
        selectedCity.country
      );
      if (isMounted) {
        setSnapshot(data);
        setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [selectedCity]);

  const handleCitySelect = (preset: CityPreset) => {
    setSelectedCity(preset);
  };

  const handleSearchQuery = async (query: string) => {
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
    }
  };

  const handleUpdateMask = (memberId: string, maskType: FamilyMember['maskType']) => {
    setFamily(prev => prev.map(m => m.id === memberId ? { ...m, maskType } : m));
  };

  const handleTriggerAiRefresh = () => {
    setIsAiProcessing(true);
    setTimeout(() => {
      setIsAiProcessing(false);
    }, 900);
  };

  // Run multi-agent deliberation
  const decision = snapshot ? runMultiAgentUrbanDefense(snapshot, family, crConfig) : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header
        currentCity={selectedCity.name}
        currentCountry={selectedCity.country}
        onSelectCity={handleCitySelect}
        onSearchQuery={handleSearchQuery}
        isAiProcessing={isAiProcessing}
        onTriggerAiRefresh={handleTriggerAiRefresh}
      />

      {/* Navigation Tabs */}
      <div className="border-b border-slate-800 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 sm:space-x-4 overflow-x-auto py-2">
          {[
            { id: 'overview', label: '🛡️ Smog Radar & Exposure' },
            { id: 'routine', label: '📅 EcoShift Routine Planner' },
            { id: 'diy_purifier', label: '🔧 DIY Corsi-Rosenthal Studio' },
            { id: 'community', label: '🤝 Community Defense Hub' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">
        {loading || !snapshot || !decision ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-slate-400">AeroSense Ingestion Agent syncing live telemetry...</p>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <SmogRadarCard snapshot={snapshot} />
                <FamilyVulnerabilityCard
                  family={family}
                  onUpdateMask={handleUpdateMask}
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
                  onApplySchedule={() => {}}
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
                  onApplySchedule={() => {}}
                />
                <AgentExplainer decision={decision} />
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer with Scientific References & Hackathon Attribution */}
      <footer className="border-t border-slate-800 bg-slate-900/60 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <div>
            <strong className="text-slate-200">AeroShield</strong> — GenAI Urban Air Defense Copilot for PromptWars: Virtual Challenge (Challenge 6)
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Scientific Models: EPA • WHO • UC Davis Air Quality Research • ASHRAE 241</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
