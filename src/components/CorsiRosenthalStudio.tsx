import React, { useState } from 'react';
import { Wind, Wrench, DollarSign, Layers, Sliders } from 'lucide-react';
import { CorsiRosenthalConfig } from '../types/airQuality';
import { calculateCorsiRosenthalMetrics } from '../utils/mathModels';

export const CorsiRosenthalStudio: React.FC = () => {
  const [config, setConfig] = useState<CorsiRosenthalConfig>({
    fanType: 'box_fan_20in',
    fanSpeedCfm: 550,
    filterRating: 'MERV13',
    filterCount: 4,
    filterThicknessInches: 2,
    roomAreaSqM: 25,
    roomCeilingHeightM: 2.7,
    roomType: 'living_room',
  });

  const [activeStep, setActiveStep] = useState<number>(1);
  const metrics = calculateCorsiRosenthalMetrics(config);

  return (
    <section
      role="region"
      aria-labelledby="iaq-studio-title"
      className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-sm"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-teal-400" aria-hidden="true" />
            <h2 id="iaq-studio-title" className="text-base font-bold text-white">
              SanctuaryAI: DIY Corsi-Rosenthal Box Purifier Studio
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-0.5">
            Engineered open-source DIY air cleaner proven by UC Davis and ASHRAE to match or exceed $500 commercial HEPA units.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30">
            WHO & CDC Hospital-Grade Spec
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left: Configuration Sliders & Options (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-200">
              <span className="flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 text-teal-400" aria-hidden="true" /> Room Dimensions & Target Space
              </span>
              <span className="text-teal-300 font-bold">{config.roomAreaSqM} m² (~{(config.roomAreaSqM * 10.764).toFixed(0)} sq ft)</span>
            </div>

            {/* Room Area Slider with Explicit Label */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <label htmlFor="room-area-input" className="font-medium">
                  Room Floor Area:
                </label>
                <span className="text-white font-semibold">{config.roomAreaSqM} m²</span>
              </div>
              <input
                id="room-area-input"
                type="range"
                min="10"
                max="80"
                step="2"
                aria-label="Room Floor Area in square meters"
                aria-valuemin={10}
                aria-valuemax={80}
                aria-valuenow={config.roomAreaSqM}
                aria-valuetext={`${config.roomAreaSqM} square meters`}
                value={config.roomAreaSqM}
                onChange={(e) => setConfig({ ...config, roomAreaSqM: Number(e.target.value) })}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>

            {/* Ceiling Height with Explicit Label */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <label htmlFor="ceiling-height-input" className="font-medium">
                  Ceiling Height:
                </label>
                <span className="text-white font-semibold">{config.roomCeilingHeightM} m</span>
              </div>
              <input
                id="ceiling-height-input"
                type="range"
                min="2.2"
                max="4.0"
                step="0.1"
                aria-label="Room Ceiling Height in meters"
                aria-valuemin={2.2}
                aria-valuemax={4.0}
                aria-valuenow={config.roomCeilingHeightM}
                aria-valuetext={`${config.roomCeilingHeightM} meters`}
                value={config.roomCeilingHeightM}
                onChange={(e) => setConfig({ ...config, roomCeilingHeightM: Number(e.target.value) })}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>

            {/* Filter Count & Architecture */}
            <div className="pt-2 border-t border-slate-700/50">
              <span id="box-config-label" className="text-xs font-semibold text-slate-200 block mb-2">
                Box Purifier Configuration:
              </span>
              <div
                role="radiogroup"
                aria-labelledby="box-config-label"
                className="grid grid-cols-2 gap-2"
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={config.filterCount === 4}
                  onClick={() => setConfig({ ...config, filterCount: 4 })}
                  className={`p-2.5 rounded-lg border text-left text-xs transition-all focus:outline-none focus:ring-2 focus:ring-teal-400 ${
                    config.filterCount === 4
                      ? 'bg-teal-500/20 border-teal-500/60 text-white font-medium ring-1 ring-teal-400/30'
                      : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <div className="font-bold text-white">4-Filter Cube</div>
                  <div className="text-[11px] text-slate-400">Standard 20" Box Fan (Top fan, 4 side filters)</div>
                </button>

                <button
                  type="button"
                  role="radio"
                  aria-checked={config.filterCount === 5}
                  onClick={() => setConfig({ ...config, filterCount: 5 })}
                  className={`p-2.5 rounded-lg border text-left text-xs transition-all focus:outline-none focus:ring-2 focus:ring-teal-400 ${
                    config.filterCount === 5
                      ? 'bg-teal-500/20 border-teal-500/60 text-white font-medium ring-1 ring-teal-400/30'
                      : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <div className="font-bold text-white">5-Filter Comparetto</div>
                  <div className="text-[11px] text-slate-400">+1 bottom elevated filter for +12% CADR</div>
                </button>
              </div>
            </div>

            {/* Filter Rating & Thickness Dropdowns */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label htmlFor="filter-rating-select" className="text-xs font-medium text-slate-300 block mb-1">
                  Filter Media Rating
                </label>
                <select
                  id="filter-rating-select"
                  aria-label="Filter Media Rating"
                  value={config.filterRating}
                  onChange={(e) => setConfig({ ...config, filterRating: e.target.value as any })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-400"
                >
                  <option value="MERV13">MERV-13 (Captures &gt;80% PM2.5 - Recommended)</option>
                  <option value="MERV14">MERV-14 (Captures &gt;88% PM2.5)</option>
                  <option value="HEPA">True HEPA (Captures 99.97% PM0.3)</option>
                </select>
              </div>

              <div>
                <label htmlFor="filter-thickness-select" className="text-xs font-medium text-slate-300 block mb-1">
                  Filter Thickness
                </label>
                <select
                  id="filter-thickness-select"
                  aria-label="Filter Thickness"
                  value={config.filterThicknessInches}
                  onChange={(e) => setConfig({ ...config, filterThicknessInches: Number(e.target.value) as any })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-400"
                >
                  <option value={1}>1-inch standard pleated filter</option>
                  <option value={2}>2-inch deep pleated (Lower resistance)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Interactive DIY Assembly Walkthrough Tabs */}
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-teal-400" aria-hidden="true" />
                DIY Assembly Blueprint (Build time: ~20 mins)
              </span>
              <div className="flex gap-1" role="group" aria-label="Assembly Steps">
                {[1, 2, 3, 4].map((step) => (
                  <button
                    key={step}
                    type="button"
                    aria-label={`View step ${step} assembly guide`}
                    aria-current={activeStep === step ? 'step' : undefined}
                    onClick={() => setActiveStep(step)}
                    className={`w-7 h-7 rounded-md text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-teal-400 ${
                      activeStep === step
                        ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                        : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                    }`}
                  >
                    {step}
                  </button>
                ))}
              </div>
            </div>

            {/* Step Content */}
            <div className="text-xs text-slate-300 space-y-2">
              {activeStep === 1 && (
                <div>
                  <div className="font-semibold text-white">Step 1: Gather Materials (Bill of Materials)</div>
                  <ul className="list-disc list-inside mt-1 space-y-1 text-slate-300">
                    <li>1x Standard 20-inch Box Fan ($22)</li>
                    <li>{config.filterCount}x MERV-13 pleated air filters 20"×20" ($45 total)</li>
                    <li>1x Roll of heavy-duty duct tape or gaffer tape ($6)</li>
                    <li>Cardboard bottom plate & 14" circular cardboard shroud cutout ($0)</li>
                  </ul>
                </div>
              )}
              {activeStep === 2 && (
                <div>
                  <div className="font-semibold text-white">Step 2: Filter Cube Assembly</div>
                  <p className="mt-1 text-slate-300">
                    Arrange the 4 filters into a hollow square. <strong className="text-amber-300">Crucial:</strong> Ensure the airflow arrows printed on all filter frames point <span className="underline">INWARD</span> towards the center of the box! Tape all vertical corner seams securely with double-layer duct tape.
                  </p>
                </div>
              )}
              {activeStep === 3 && (
                <div>
                  <div className="font-semibold text-white">Step 3: Base Plate & Fan Mounting</div>
                  <p className="mt-1 text-slate-300">
                    Seal the bottom with a 20"×20" flat cardboard sheet (or the 5th filter for the Comparetto variant). Place the 20" box fan on top, blowing air <span className="underline">UPWARD</span> into the room. Tape all edges along the fan perimeter airtight.
                  </p>
                </div>
              )}
              {activeStep === 4 && (
                <div>
                  <div className="font-semibold text-white">Step 4: The 14-Inch Shroud Secret (+30% Efficiency)</div>
                  <p className="mt-1 text-slate-300">
                    Cut a 14-inch circular hole in a piece of cardboard and tape it onto the front grille of the box fan. This blocks the aerodynamic vortex recirculation at the blade tips, boosting effective CADR airflow by over 30%!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Scientific CADR & ACH Output Metrics (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Airflow & CADR Card */}
          <div className="bg-gradient-to-br from-teal-950/70 to-slate-900 border border-teal-500/30 rounded-xl p-5 shadow-lg relative overflow-hidden">
            <div className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
              <Wind className="h-4 w-4" aria-hidden="true" />
              Clean Air Delivery Rate (CADR)
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <div className="text-4xl font-black text-white">{metrics.cadrCubicMetersPerHour}</div>
              <div className="text-xs text-teal-200">m³/hour CADR</div>
            </div>

            {/* ACH Metric */}
            <div className="mt-4 pt-3 border-t border-teal-500/20 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-300 font-medium">Room Air Changes:</div>
                <div className="text-2xl font-extrabold text-white mt-0.5">{metrics.ach} ACH</div>
              </div>
              <div className="text-right">
                <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40">
                  {metrics.achRating}
                </span>
                <div className="text-[11px] text-slate-400 mt-1">CDC benchmark: &gt;5.0 ACH</div>
              </div>
            </div>
          </div>

          {/* Economic Disruption & Savings Card */}
          <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
              <DollarSign className="h-4 w-4 text-emerald-400" aria-hidden="true" />
              Economic Accessibility vs. Commercial Purifiers
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>DIY Build Cost:</span>
                <span className="font-bold text-emerald-400 text-sm">${metrics.diyEstimatedCostUsd}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Equivalent Commercial Brand (e.g. Coway/Blueair):</span>
                <span className="line-through text-rose-300 text-xs">${metrics.commercialEquivalentCostUsd}</span>
              </div>
              <div className="pt-2 border-t border-slate-700 flex justify-between items-center">
                <span className="font-semibold text-white">Household Savings:</span>
                <span className="font-extrabold text-emerald-300 text-base">+${metrics.moneySavedUsd} Saved</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-300 italic">
              Democratizes clean air for low-and-middle-income urban families during peak emergency winter smog.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
