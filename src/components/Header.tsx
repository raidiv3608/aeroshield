import React, { useState } from 'react';
import { Shield, MapPin, Search, Wind, Sparkles, ChevronDown } from 'lucide-react';
import { GLOBAL_SMOG_HOTSPOTS } from '../services/airQualityService';
import { CityPreset } from '../types/airQuality';

interface HeaderProps {
  currentCity: string;
  currentCountry: string;
  onSelectCity: (preset: CityPreset) => void;
  onSearchQuery: (query: string) => void;
  isAiProcessing: boolean;
  onTriggerAiRefresh: () => void;
}

export const Header: React.FC<HeaderProps> = React.memo(({
  currentCity,
  currentCountry,
  onSelectCity,
  onSearchQuery,
  isAiProcessing,
  onTriggerAiRefresh,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [showPresets, setShowPresets] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearchQuery(searchInput.trim());
    }
  };

  return (
    <header role="banner" className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Mission */}
        <div className="flex items-center gap-3">
          <div
            aria-hidden="true"
            className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400/40"
          >
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-xl tracking-tight text-white">AeroShield</h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                GenAI Smog Defense
              </span>
            </div>
            <p className="text-xs text-slate-300">Urban Winter Smog, IAQ Hacks & Community Copilot</p>
          </div>
        </div>

        {/* Global Hotspots & Search Bar */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Quick Presets Toggle Button */}
          <div className="relative">
            <button
              type="button"
              id="city-presets-button"
              aria-haspopup="listbox"
              aria-expanded={showPresets}
              aria-controls="city-presets-listbox"
              aria-label={`Current city: ${currentCity}, ${currentCountry}. Click to choose from global winter smog hotspots.`}
              onClick={() => setShowPresets(!showPresets)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-500 text-xs text-slate-100 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              <MapPin className="h-4 w-4 text-emerald-400 shrink-0" aria-hidden="true" />
              <span>{currentCity}, {currentCountry}</span>
              <ChevronDown className="h-3 w-3 text-slate-400" aria-hidden="true" />
            </button>

            {showPresets && (
              <div
                id="city-presets-listbox"
                role="listbox"
                aria-label="Global Winter Smog Hotspots"
                className="absolute left-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2"
              >
                <div className="text-[11px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                  Global Winter Smog Capitals
                </div>
                {GLOBAL_SMOG_HOTSPOTS.map((hotspot) => {
                  const isCurrent = hotspot.name === currentCity;
                  return (
                    <button
                      key={hotspot.name}
                      role="option"
                      aria-selected={isCurrent}
                      onClick={() => {
                        onSelectCity(hotspot);
                        setShowPresets(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors flex flex-col focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                        isCurrent
                          ? 'bg-emerald-500/20 text-emerald-200 font-semibold'
                          : 'text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{hotspot.name}, {hotspot.country}</span>
                        {isCurrent && <span className="text-[10px] text-emerald-400 font-bold" aria-hidden="true">Active</span>}
                      </div>
                      <span className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{hotspot.regionDescription}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Search Form with Accessible Label */}
          <form onSubmit={handleSearchSubmit} role="search" className="flex items-center relative">
            <label htmlFor="city-search-input" className="sr-only">
              Search any global city for live air quality
            </label>
            <input
              id="city-search-input"
              type="search"
              autoComplete="off"
              placeholder="Search global city..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-8 pr-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-400 text-xs w-44 sm:w-56 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
            />
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 pointer-events-none" aria-hidden="true" />
          </form>

          {/* AI Re-evaluate Button */}
          <button
            type="button"
            onClick={onTriggerAiRefresh}
            disabled={isAiProcessing}
            aria-label="Re-run Multi-Agent Reasoning Deliberation"
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-900 ${
              isAiProcessing
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20 hover:shadow-emerald-500/30'
            }`}
          >
            <Sparkles className={`h-3.5 w-3.5 ${isAiProcessing ? 'animate-spin text-emerald-300' : 'text-emerald-200'}`} aria-hidden="true" />
            <span>{isAiProcessing ? 'Agents Deliberating...' : 'Re-Run Multi-Agent'}</span>
          </button>
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';
