import React, { useState } from 'react';
import { Users, Award, Heart, Share2, PlusCircle, Check } from 'lucide-react';
import { CommunityPledge } from '../types/airQuality';
import confetti from 'canvas-confetti';

interface CommunityShieldCardProps {
  pledges: CommunityPledge[];
}

export const CommunityShieldCard: React.FC<CommunityShieldCardProps> = ({ pledges: initialPledges }) => {
  const [pledges, setPledges] = useState<CommunityPledge[]>(initialPledges);
  const [pledgedToday, setPledgedToday] = useState(false);

  const totalParticipants = pledges.reduce((acc, p) => acc + p.participantsCount, 0);
  const totalPmKg = pledges.reduce((acc, p) => acc + p.pm25AvoidedKgTotal, 0);
  const totalCo2Kg = pledges.reduce((acc, p) => acc + p.co2AvoidedKgTotal, 0);

  const handleTakePledge = () => {
    if (pledgedToday) return;
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 }
    });
    setPledgedToday(true);
    setPledges([
      {
        id: `p-${Date.now()}`,
        neighborhood: 'My Neighborhood Collective',
        actionTitle: 'Pledged: No-idling near school drop-off + shifted commute to Metro',
        category: 'anti_idling',
        participantsCount: 1,
        pm25AvoidedKgTotal: 0.12,
        co2AvoidedKgTotal: 18.5,
        timestamp: 'Just now',
      },
      ...pledges,
    ]);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">CommunityShield: Hyper-Local Collective Defense</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Air is a shared commons. One family's habit shift multiplies across neighborhoods to break winter smog.
          </p>
        </div>

        <button
          onClick={handleTakePledge}
          disabled={pledgedToday}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md ${
            pledgedToday
              ? 'bg-indigo-600/30 border border-indigo-500/50 text-indigo-300 cursor-default'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
          }`}
        >
          {pledgedToday ? <Check className="h-3.5 w-3.5" /> : <PlusCircle className="h-3.5 w-3.5" />}
          {pledgedToday ? 'Community Pledge Active!' : 'Sign Neighborhood Smog Pledge'}
        </button>
      </div>

      {/* Aggregate Collective Impact Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-4">
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 text-center">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Active Families & Pledges</div>
          <div className="text-xl font-extrabold text-white mt-0.5">{totalParticipants}</div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 text-center">
          <div className="text-[11px] text-emerald-400 uppercase font-semibold">Collective PM2.5 Abated</div>
          <div className="text-xl font-extrabold text-emerald-300 mt-0.5">{totalPmKg.toFixed(1)} kg PM2.5</div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 text-center">
          <div className="text-[11px] text-teal-400 uppercase font-semibold">CO2 Emissions Prevented</div>
          <div className="text-xl font-extrabold text-teal-300 mt-0.5">{(totalCo2Kg / 1000).toFixed(2)} Metric Tons</div>
        </div>
      </div>

      {/* Neighborhood Feed */}
      <div className="space-y-2.5">
        {pledges.map((pledge) => (
          <div
            key={pledge.id}
            className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white">{pledge.actionTitle}</span>
                <span className="text-[10px] text-slate-400 font-mono">({pledge.timestamp})</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                📍 {pledge.neighborhood} • {pledge.participantsCount} community members involved
              </div>
            </div>

            <div className="text-[11px] text-emerald-400 font-medium shrink-0 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              +{pledge.pm25AvoidedKgTotal}kg PM2.5 avoided
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
