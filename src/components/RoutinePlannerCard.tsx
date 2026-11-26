import React, { useState } from 'react';
import { Calendar, ArrowRight, ShieldCheck, Leaf, Bus, Car, Bike, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { RoutineTask } from '../types/airQuality';

interface RoutinePlannerCardProps {
  tasks: RoutineTask[];
  onApplySchedule: () => void;
}

export const RoutinePlannerCard: React.FC<RoutinePlannerCardProps> = React.memo(({ tasks, onApplySchedule }) => {
  const [applied, setApplied] = useState(false);

  const handleApply = () => {
    setApplied(true);
    // Respect user's motion preferences
    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        disableForReducedMotion: true,
      });
    }
    onApplySchedule();
  };

  const totalPmSavedGrams = tasks.reduce((acc, t) => acc + t.pmAvoidedGrams, 0);
  const totalCo2SavedKg = tasks.reduce((acc, t) => acc + t.co2AvoidedKg, 0);

  const getTransitIcon = (transit: RoutineTask['originalTransit']) => {
    switch (transit) {
      case 'single_ice_car': return <Car className="h-3.5 w-3.5 text-rose-300" aria-hidden="true" />;
      case 'metro_bus': return <Bus className="h-3.5 w-3.5 text-emerald-300" aria-hidden="true" />;
      case 'walk_cycle': return <Bike className="h-3.5 w-3.5 text-teal-300" aria-hidden="true" />;
      case 'carpool': return <Car className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />;
      default: return <Car className="h-3.5 w-3.5 text-slate-300" aria-hidden="true" />;
    }
  };

  return (
    <section
      role="region"
      aria-labelledby="routine-planner-title"
      className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-sm"
    >
      {/* Title & Stats Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-emerald-400" aria-hidden="true" />
            <h2 id="routine-planner-title" className="text-base font-bold text-white">
              EcoShift: Dynamic Daily Routine Rescheduler
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-0.5">
            Shifts high-exertion routines away from morning smog traps into afternoon dispersion troughs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-right">
            <div className="text-[10px] text-emerald-300 font-semibold uppercase">Community Airshed Benefit</div>
            <div className="text-sm font-bold text-emerald-200">
              +{totalPmSavedGrams.toFixed(2)}g PM2.5 avoided | {totalCo2SavedKg.toFixed(1)}kg CO2
            </div>
          </div>

          <button
            type="button"
            onClick={handleApply}
            aria-label="Apply optimized low-emission routine schedule"
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-900 ${
              applied
                ? 'bg-emerald-600 text-white shadow-emerald-500/30'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold'
            }`}
          >
            {applied ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> : <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />}
            {applied ? 'Schedule Adopted!' : 'Apply Smart Schedule'}
          </button>
        </div>
      </div>

      {/* Task Comparison Cards Grid */}
      <div className="mt-4 space-y-3" role="list" aria-label="Daily Routine Tasks Comparison">
        {tasks.map((task) => (
          <article
            key={task.id}
            role="listitem"
            className="bg-slate-800/60 border border-slate-700/70 hover:border-slate-500 rounded-xl p-3.5 transition-all"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              {/* Task Details */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-white">{task.title}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-200 font-medium capitalize">
                    {task.category}
                  </span>
                </div>
                <p className="text-xs text-slate-300 max-w-xl">{task.rationale}</p>
              </div>

              {/* Time & Transit Shift Pill */}
              <div className="flex items-center gap-3 shrink-0">
                {/* Before */}
                <div className="bg-slate-900/80 border border-rose-500/30 rounded-lg px-2.5 py-1.5 text-center">
                  <div className="text-[10px] text-rose-300 font-semibold uppercase">Baseline</div>
                  <div className="text-xs font-bold text-slate-200">{String(task.originalHour).padStart(2, '0')}:00</div>
                  <div className="text-[10px] text-slate-300 flex items-center justify-center gap-1 mt-0.5">
                    {getTransitIcon(task.originalTransit)}
                    <span className="capitalize">{task.originalTransit.replace(/_/g, ' ')}</span>
                  </div>
                </div>

                <ArrowRight className="h-4 w-4 text-emerald-400 shrink-0" aria-hidden="true" />

                {/* After / Optimized */}
                <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-lg px-2.5 py-1.5 text-center">
                  <div className="text-[10px] text-emerald-300 font-bold uppercase">AI Shifted</div>
                  <div className="text-xs font-bold text-emerald-200">{String(task.optimizedHour).padStart(2, '0')}:00</div>
                  <div className="text-[10px] text-emerald-300 flex items-center justify-center gap-1 mt-0.5">
                    {getTransitIcon(task.optimizedTransit)}
                    <span className="capitalize">{task.optimizedTransit.replace(/_/g, ' ')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Impact Metrics Footer */}
            <div className="mt-2.5 pt-2 border-t border-slate-700/50 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-emerald-300 font-medium">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                  Lung Inhaled PM2.5: {task.originalExposureUrg} µg → <strong className="text-white font-bold">{task.optimizedExposureUrg} µg</strong> (-{Math.round(((task.originalExposureUrg - task.optimizedExposureUrg) / (task.originalExposureUrg || 1)) * 100)}%)
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <Leaf className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                Avoided: <span className="font-semibold text-emerald-300">+{task.pmAvoidedGrams}g PM2.5</span> & <span className="font-semibold text-teal-300">+{task.co2AvoidedKg}kg CO2</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
});

RoutinePlannerCard.displayName = 'RoutinePlannerCard';
