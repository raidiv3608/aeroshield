import React from 'react';
import { Bot, Cpu, GitFork, ShieldCheck, Sparkles, HelpCircle, BookOpen } from 'lucide-react';
import { MultiAgentDecisionResult } from '../agents/agentOrchestrator';

interface AgentExplainerProps {
  decision: MultiAgentDecisionResult;
}

export const AgentExplainer: React.FC<AgentExplainerProps> = ({ decision }) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
        <Cpu className="h-5 w-5 text-purple-400" />
        <div>
          <h3 className="text-base font-bold text-white">ImpactLens: Multi-Agent Reasoning & Scientific Transparency</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Peer-reviewed scientific justification explaining how every recommendation was formulated.
          </p>
        </div>
      </div>

      {/* Main Agent Dialogue Speech */}
      <div className="mt-4 bg-purple-950/20 border border-purple-500/30 rounded-xl p-4">
        <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="h-4 w-4" />
          AI Synthesis for Your Family
        </div>
        <p className="text-xs text-slate-200 leading-relaxed font-medium">
          "{decision.impactSpeech}"
        </p>
      </div>

      {/* 5-Agent Architecture Breakdown */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-2.5">
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
          <div className="text-[10px] font-bold text-cyan-400 uppercase">1. AeroSense Agent</div>
          <div className="text-xs font-semibold text-white mt-1">Boundary Layer Radar</div>
          <div className="text-[11px] text-slate-400 mt-1">Tracks thermal inversion compression and identifies solar dispersion windows.</div>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
          <div className="text-[10px] font-bold text-rose-400 uppercase">2. PulmoGuard Agent</div>
          <div className="text-xs font-semibold text-white mt-1">Lung Inhalation Dosage</div>
          <div className="text-[11px] text-slate-400 mt-1">Calculates physical microgram particulate deposition across vulnerable family members.</div>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
          <div className="text-[10px] font-bold text-emerald-400 uppercase">3. EcoShift Agent</div>
          <div className="text-xs font-semibold text-white mt-1">Routine Rescheduler</div>
          <div className="text-[11px] text-slate-400 mt-1">Re-routes transit modes and shifts workouts to low-AQI midday hours.</div>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
          <div className="text-[10px] font-bold text-teal-400 uppercase">4. SanctuaryAI Agent</div>
          <div className="text-xs font-semibold text-white mt-1">IAQ & DIY Purifier</div>
          <div className="text-[11px] text-slate-400 mt-1">Calculates room volume CADR & ACH for DIY Corsi-Rosenthal filtration.</div>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
          <div className="text-[10px] font-bold text-indigo-400 uppercase">5. CommunityShield</div>
          <div className="text-xs font-semibold text-white mt-1">Collective Multiplier</div>
          <div className="text-[11px] text-slate-400 mt-1">Aggregates neighborhood pledges to build collective clean air resilience.</div>
        </div>
      </div>
    </div>
  );
};
