import React from 'react';
import { Home, Wind, Flame, CheckCircle2 } from 'lucide-react';

interface IndoorHacksCardProps {
  windowVentilationSlot: string;
  ventilationRationale: string;
  cookingAndHeatingHacks: string[];
}

export const IndoorHacksCard: React.FC<IndoorHacksCardProps> = React.memo(({
  windowVentilationSlot,
  ventilationRationale,
  cookingAndHeatingHacks,
}) => {
  return (
    <section
      role="region"
      aria-labelledby="indoor-hacks-title"
      className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-sm"
    >
      <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
        <Home className="h-5 w-5 text-amber-400" aria-hidden="true" />
        <div>
          <h2 id="indoor-hacks-title" className="text-base font-bold text-white">
            Smart Indoor Air Quality (IAQ) & Home Hacks
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Science-backed behavioral adjustments preventing indoor air from becoming more toxic than outdoor air.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {/* Ventilation Timing Optimizer */}
        <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
              <Wind className="h-4 w-4" aria-hidden="true" /> Recommended Ventilation Window
            </h3>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
              Optimal Flush Time
            </span>
          </div>

          <div className="text-sm font-extrabold text-white">{windowVentilationSlot}</div>
          <p className="text-xs text-slate-200 leading-relaxed">{ventilationRationale}</p>
        </div>

        {/* Heating & Cooking Adjustments */}
        <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-4 space-y-2">
          <h3 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
            <Flame className="h-4 w-4" aria-hidden="true" /> Cooking & Winter Heating Defense
          </h3>

          <ul className="space-y-2 mt-1" role="list">
            {cookingAndHeatingHacks.map((hack, idx) => (
              <li key={idx} className="text-xs text-slate-200 flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-teal-400 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{hack}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
});

IndoorHacksCard.displayName = 'IndoorHacksCard';
