import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceArea, ReferenceLine } from 'recharts';
import { AlertTriangle, Clock, Wind, Sun, ShieldAlert, Sparkles } from 'lucide-react';
import { AirQualitySnapshot } from '../types/airQuality';
import { getAqiCategory } from '../services/airQualityService';

interface SmogRadarCardProps {
  snapshot: AirQualitySnapshot;
}

export const SmogRadarCard: React.FC<SmogRadarCardProps> = ({ snapshot }) => {
  const { level, label, color, description } = getAqiCategory(snapshot.currentPm25);

  const chartData = snapshot.hourly.map(h => ({
    hour: h.time,
    rawHour: h.hour,
    pm25: h.pm25,
    usAqi: h.usAqi,
    temp: h.temperature,
    wind: h.windSpeed,
    inversion: h.inversionRisk,
  }));

  const best = snapshot.goldenDispersionWindow;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-sm relative overflow-hidden">
      {/* Background glow badge */}
      <div
        className="absolute -top-24 -right-24 w-60 h-60 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: color }}
      />

      {/* Top Banner: Current Reading & Severity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Big Numbers & Level */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-white"
              style={{ backgroundColor: color }}
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              {label}
            </span>
            <span className="text-xs text-slate-400">Live Sensory Ingestion</span>
          </div>

          <div className="flex items-baseline gap-3">
            <div className="text-5xl font-black tracking-tight text-white">{snapshot.currentAqi}</div>
            <div className="text-sm font-medium text-slate-400">
              US AQI <span className="text-slate-600">/</span> {snapshot.currentPm25} <span className="text-xs">µg/m³ PM2.5</span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">{description}</p>

          {/* Micro Telemetry Pills */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700/60">
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <Wind className="h-3 w-3 text-cyan-400" /> Wind Velocity
              </div>
              <div className="text-sm font-bold text-slate-200 mt-0.5">
                {snapshot.windSpeed} km/h {snapshot.windSpeed < 5 && <span className="text-[10px] text-amber-400 font-normal">(Stagnant)</span>}
              </div>
            </div>
            <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700/60">
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <Sun className="h-3 w-3 text-amber-400" /> Temperature
              </div>
              <div className="text-sm font-bold text-slate-200 mt-0.5">
                {snapshot.temperature}°C <span className="text-[10px] text-slate-400 font-normal">Winter chill</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Inversion Science & Golden Window */}
        <div className="lg:col-span-2 space-y-4">
          {/* Golden Dispersion Window Card */}
          <div className="bg-gradient-to-r from-emerald-950/60 via-slate-800/80 to-teal-950/60 border border-emerald-500/30 rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
              <Sparkles className="h-4 w-4" />
              Golden Atmospheric Dispersion Window Today
            </div>
            <div className="mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-lg font-bold text-white">
                  {best.startHour}:00 - {best.endHour}:00 (Midday Solar Mixing)
                </span>
                <p className="text-xs text-emerald-200/80 mt-0.5">{best.reason}</p>
              </div>
              <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg px-3 py-1.5 text-center whitespace-nowrap">
                <div className="text-[10px] uppercase font-bold text-emerald-400">Dip to Approx</div>
                <div className="text-base font-extrabold">{best.averageAqi} AQI</div>
              </div>
            </div>
          </div>

          {/* Inversion Mechanism Warning */}
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3.5 flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300">
              <span className="font-semibold text-slate-100">Winter Boundary Layer Trap:</span> Calm winds (&lt;5 km/h) and nocturnal radiational cooling compress the atmospheric mixing height to under 150 meters, trapping vehicular exhausts and domestic smoke near ground level between 04:00 and 09:00.
            </div>
          </div>
        </div>
      </div>

      {/* 24-Hour Diurnal Forecast Chart */}
      <div className="mt-6 pt-4 border-t border-slate-800">
        <div className="flex flex-col sm:flex-row justify-between items-baseline mb-3 gap-1">
          <div>
            <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              24-Hour Diurnal PM2.5 & Inversion Trajectory
            </h4>
            <p className="text-[11px] text-slate-400">Notice the heavy morning and late evening peaks vs. afternoon solar dispersion trough</p>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-slate-400">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block"></span> Golden Window</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-rose-600 inline-block"></span> Smog Inversion Peak</span>
          </div>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="pm25Gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.6}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="hour" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg shadow-xl text-xs space-y-1">
                        <div className="font-bold text-white">{data.hour} — AQI {data.usAqi}</div>
                        <div className="text-emerald-400">PM2.5: {data.pm25} µg/m³</div>
                        <div className="text-slate-300">Temp: {data.temp}°C | Wind: {data.wind} km/h</div>
                        <div className="text-amber-400 text-[10px]">Inversion: {data.inversion}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="pm25"
                stroke={color}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#pm25Gradient)"
              />
              {/* Highlight Golden Window */}
              <ReferenceArea
                x1={`${String(best.startHour).padStart(2, '0')}:00`}
                x2={`${String(best.endHour).padStart(2, '0')}:00`}
                strokeOpacity={0.3}
                fill="#10b981"
                fillOpacity={0.15}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
