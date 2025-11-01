import React, { useMemo, useState } from 'react';
import type { TrainingSession } from '../lib/supabase';

type MetricKey = 'hs_rate' | 'accuracy' | 'kills' | 'deaths' | 'duration_minutes' | 'kd';

type ResultsChartProps = {
  sessions: TrainingSession[];
  metric: MetricKey;
  height?: number;
  exerciseType?: string; // optional filter by exercise type
};

function formatDateLabel(iso: string) {
  try {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  } catch {
    return iso.slice(0, 10);
  }
}

function getMetricValue(s: TrainingSession, metric: MetricKey) {
  if (metric === 'kd') {
    return s.deaths === 0 ? s.kills : s.kills / s.deaths;
  }
  return Number(s[metric] as any);
}

export default function ResultsChart({ sessions, metric, height = 220, exerciseType }: ResultsChartProps) {
  const [showMin, setShowMin] = useState(true);
  const [showAvg, setShowAvg] = useState(true);
  const [showMax, setShowMax] = useState(true);

  const filtered = useMemo(() => {
    if (!exerciseType) return sessions;
    return sessions.filter(s => (s.exercise_type || '').toLowerCase() === exerciseType.toLowerCase());
  }, [sessions, exerciseType]);

  if (!filtered || filtered.length === 0) {
    return (
      <div className="p-6 text-zinc-500">Aucune donnée de session pour le graphique.</div>
    );
  }

  // Sort by date ascending for a left-to-right progression
  const sorted = [...filtered].sort((a, b) =>
    new Date(a.session_date).getTime() - new Date(b.session_date).getTime()
  );

  const values = sorted.map(s => getMetricValue(s, metric));
  const yMin = Math.min(...values);
  const yMaxRaw = Math.max(...values);
  const yMax = yMaxRaw === yMin ? yMin + 1 : yMaxRaw;
  const yAvg = values.reduce((a, b) => a + b, 0) / values.length;

  const width = 640; // fixed width container; responsive could be added later
  const padding = 30;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  const points = values.map((v, i) => {
    const x = padding + (i / Math.max(sorted.length - 1, 1)) * innerWidth;
    const ratio = (v - yMin) / (yMax - yMin);
    const y = padding + innerHeight - ratio * innerHeight;
    return `${x},${y}`;
  });

  const path = `M ${points.join(' L ')}`;

  const refLinePath = (value: number) => {
    // horizontal line across chart space
    const ratio = (value - yMin) / (yMax - yMin);
    const y = padding + innerHeight - ratio * innerHeight;
    return `M ${padding} ${y} L ${width - padding} ${y}`;
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="text-sm text-zinc-400">Métrique: <span className="text-white font-medium">{metric.toUpperCase()}</span></div>
          {exerciseType && (
            <div className="text-sm text-zinc-400">Exercice: <span className="text-white font-medium">{exerciseType}</span></div>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs">
          <label className="flex items-center gap-1 text-zinc-400"><input type="checkbox" checked={showMin} onChange={e => setShowMin(e.target.checked)} /> Min</label>
          <label className="flex items-center gap-1 text-zinc-400"><input type="checkbox" checked={showAvg} onChange={e => setShowAvg(e.target.checked)} /> Avg</label>
          <label className="flex items-center gap-1 text-zinc-400"><input type="checkbox" checked={showMax} onChange={e => setShowMax(e.target.checked)} /> Max</label>
          <div className="text-sm text-zinc-400">Min: <span className="text-white">{yMin.toFixed(2)}</span> · Max: <span className="text-white">{yMax.toFixed(2)}</span></div>
        </div>
      </div>
      <svg width={width} height={height} className="bg-zinc-900/40 rounded-md border border-zinc-800">
        {/* Axes */}
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#3f3f46" strokeWidth={1} />
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#3f3f46" strokeWidth={1} />

        {/* Reference lines */}
        {showMin && (<path d={refLinePath(yMin)} fill="none" stroke="#ef4444" strokeWidth={1} strokeDasharray="5,5" />)}
        {showAvg && (<path d={refLinePath(yAvg)} fill="none" stroke="#eab308" strokeWidth={1} strokeDasharray="5,5" />)}
        {showMax && (<path d={refLinePath(yMax)} fill="none" stroke="#22c55e" strokeWidth={1} strokeDasharray="5,5" />)}

        {/* Gradient */}
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
        </defs>

        {/* Path */}
        <path d={path} fill="none" stroke="url(#progressGradient)" strokeWidth={2} />

        {/* Points */}
        {points.map((p, i) => {
          const [xStr, yStr] = p.split(',');
          const x = Number(xStr);
          const y = Number(yStr);
          // interpolate color from orange to green based on index
          const t = (i) / Math.max(points.length - 1, 1);
          const r = Math.round(249 * (1 - t) + 34 * t); // 0xF9 -> 249, 34
          const g = Math.round(115 * (1 - t) + 197 * t); // 0x73 -> 115, 197
          const b = Math.round(22 * (1 - t) + 94 * t);   // 0x16 -> 22, 94
          const color = `rgb(${r}, ${g}, ${b})`;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={3} fill={color} />
              {/* Date labels every N points */}
              {i % Math.ceil(sorted.length / 6) === 0 && (
                <text x={x} y={height - padding + 14} fontSize={10} textAnchor="middle" fill="#a1a1aa">
                  {formatDateLabel(sorted[i].session_date)}
                </text>
              )}
            </g>
          );
        })}

        {/* Y labels */}
        <text x={padding - 6} y={padding} fontSize={10} textAnchor="end" fill="#a1a1aa">{yMax.toFixed(2)}</text>
        <text x={padding - 6} y={height - padding} fontSize={10} textAnchor="end" fill="#a1a1aa">{yMin.toFixed(2)}</text>
      </svg>
    </div>
  );
}