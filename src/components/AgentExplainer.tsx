import React from 'react';
import { Cpu, Sparkles } from 'lucide-react';
import { MultiAgentDecisionResult } from '../agents/agentOrchestrator';

interface AgentExplainerProps {
  decision: MultiAgentDecisionResult;
}

export const AgentExplainer: React.FC<AgentExplainerProps> = React.memo(({ decision }) => {
  return (
    <section
      role="region"
      aria-labelledby="agent-explainer-title"
      className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-sm"
    >
      {/* Header */}
      <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
        <Cpu className="h-5 w-5 text-purple-400" aria-hidden="true" />
        <div>
          <h2 id="agent-explainer-title" className="text-base font-bold text-white">
            ImpactLens: Multi-Agent Reasoning & Scientific Transparency
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Peer-reviewed scientific justification explaining how every recommendation was formulated.
          </p>
        </div>
      </div>

      {/* Main Agent Dialogue Speech */}
      <div className="mt-4 bg-purple-950/20 border border-purple-500/30 rounded-xl p-4">
        <div className="flex items-center gap-2 text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          AI Synthesis for Your Family
        </div>
        <blockquote className="text-xs text-slate-200 leading-relaxed font-medium">
          "{decision.impactSpeech}"
        </blockquote>
      </div>

      {/* 5-Agent Architecture Breakdown */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-2.5" role="list" aria-label="Five Agents Breakdown">
        <article role="listitem" className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
          <div className="text-[11px] font-bold text-cyan-300 uppercase">1. AeroSense Agent</div>
          <h3 className="text-xs font-semibold text-white mt-1">Boundary Layer Radar</h3>
          <p className="text-xs text-slate-300 mt-1">Tracks thermal inversion compression and identifies solar dispersion windows.</p>
        </article>

        <article role="listitem" className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
          <div className="text-[11px] font-bold text-rose-300 uppercase">2. PulmoGuard Agent</div>
          <h3 className="text-xs font-semibold text-white mt-1">Lung Inhalation Dosage</h3>
          <p className="text-xs text-slate-300 mt-1">Calculates physical microgram particulate deposition across vulnerable family members.</p>
        </article>

        <article role="listitem" className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
          <div className="text-[11px] font-bold text-emerald-300 uppercase">3. EcoShift Agent</div>
          <h3 className="text-xs font-semibold text-white mt-1">Routine Rescheduler</h3>
          <p className="text-xs text-slate-300 mt-1">Re-routes transit modes and shifts workouts to low-AQI midday hours.</p>
        </article>

        <article role="listitem" className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
          <div className="text-[11px] font-bold text-teal-300 uppercase">4. SanctuaryAI Agent</div>
          <h3 className="text-xs font-semibold text-white mt-1">IAQ & DIY Purifier</h3>
          <p className="text-xs text-slate-300 mt-1">Calculates room volume CADR & ACH for DIY Corsi-Rosenthal filtration.</p>
        </article>

        <article role="listitem" className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
          <div className="text-[11px] font-bold text-indigo-300 uppercase">5. CommunityShield</div>
          <h3 className="text-xs font-semibold text-white mt-1">Collective Multiplier</h3>
          <p className="text-xs text-slate-300 mt-1">Aggregates neighborhood pledges to build collective clean air resilience.</p>
        </article>
      </div>
    </section>
  );
});

AgentExplainer.displayName = 'AgentExplainer';
