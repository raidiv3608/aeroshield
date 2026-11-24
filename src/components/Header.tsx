import React, { useState } from 'react';
import { Shield, MapPin, Search, Wind, Sparkles } from 'lucide-react';
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

export const Header: React.FC<HeaderProps> = ({
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
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Mission */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400/30">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl tracking-tight text-white">AeroShield</span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                GenAI Smog Defense
              </span>
            </div>
            <p className="text-xs text-slate-400">Urban Winter Smog, IAQ Hacks & Community Copilot</p>
          </div>
        </div>

        {/* Global Hotspots & Search Bar */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Quick Presets Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowPresets(!showPresets)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-600 text-xs text-slate-200 transition-colors"
            >
              <MapPin className="h-3.5 w-3.5 text-emerald-400" />
              <span className="font-medium">{currentCity}, {currentCountry}</span>
              <span className="text-slate-400 text-[10px]">▼</span>
            </button>

            {showPresets && (
              <div className="absolute left-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">
                  Global Winter Smog Capitals
                </div>
                {GLOBAL_SMOG_HOTSPOTS.map((hotspot) => (
                  <button
                    key={hotspot.name}
                    onClick={() => {
                      onSelectCity(hotspot);
                      setShowPresets(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors flex flex-col ${
                      hotspot.name === currentCity
                        ? 'bg-emerald-500/10 text-emerald-300 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{hotspot.name}, {hotspot.country}</span>
                      {hotspot.name === currentCity && <span className="text-[10px] text-emerald-400">Active</span>}
                    </div>
                    <span className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{hotspot.regionDescription}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="flex items-center relative">
            <input
              type="text"
              placeholder="Search any global city..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 focus:border-emerald-500 focus:outline-none text-xs text-slate-100 placeholder-slate-400 w-44 sm:w-56"
            />
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
          </form>

          {/* AI Re-evaluate Button */}
          <button
            onClick={onTriggerAiRefresh}
            disabled={isAiProcessing}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-md ${
              isAiProcessing
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20 hover:shadow-emerald-500/30'
            }`}
          >
            <Sparkles className={`h-3.5 w-3.5 ${isAiProcessing ? 'animate-spin text-emerald-400' : 'text-emerald-200'}`} />
            <span>{isAiProcessing ? 'Agents Thinking...' : 'Re-Run Multi-Agent'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
