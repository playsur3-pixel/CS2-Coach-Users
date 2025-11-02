import React, { useMemo, useState } from "react";

type TrainingSession = {
  session_date: string;
  exercise_type?: string;
  hs_rate?: number;
  accuracy?: number;
  kills?: number;
  deaths?: number;
  duration_minutes?: number;
};

type MetricKey =
  | "hs_rate"
  | "accuracy"
  | "kills"
  | "deaths"
  | "duration_minutes"
  | "kd";

type ResultsChartProps = {
  sessions: TrainingSession[];
  metric: MetricKey;
  height?: number;
  exerciseType?: string;
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
  if (metric === "kd")
    return s.deaths === 0 ? s.kills ?? 0 : (s.kills ?? 0) / (s.deaths ?? 1);
  return Number(s[metric] ?? 0);
}

export default function ResultsChart({
  sessions,
  metric,
  height = 220,
  exerciseType,
}: ResultsChartProps) {
  const [showMin, setShowMin] = useState(true);
  const [showAvg, setShowAvg] = useState(true);
  const [showMax, setShowMax] = useState(true);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // 🧮 Préparation optimisée
  const { sorted, values, yMin, yMax, yAvg } = useMemo(() => {
    const filtered = exerciseType
      ? sessions.filter(
          (s) =>
            (s.exercise_type || "").toLowerCase() === exerciseType.toLowerCase()
        )
      : sessions;

    const sortedData = [...filtered].sort(
      (a, b) =>
        new Date(a.session_date).getTime() - new Date(b.session_date).getTime()
    );

    const vals = sortedData.map((s) => getMetricValue(s, metric));
    const min = Math.min(...vals);
    const maxRaw = Math.max(...vals);
    const max = maxRaw === min ? min + 1 : maxRaw;
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;

    return {
      sorted: sortedData,
      values: vals,
      yMin: min,
      yMax: max,
      yAvg: avg,
    };
  }, [sessions, metric, exerciseType]);

  if (!sorted.length) {
    return (
      <div className="p-6 text-zinc-500">
        Aucune donnée de session pour le graphique.
      </div>
    );
  }

  // 🧭 Dimensions
  const width = 640;
  const padding = 30;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  const points = useMemo(() => {
    return values.map((v, i) => {
      const x = padding + (i / Math.max(sorted.length - 1, 1)) * innerWidth;
      const ratio = (v - yMin) / (yMax - yMin);
      const y = padding + innerHeight - ratio * innerHeight;
      return { x, y, value: v, date: sorted[i].session_date };
    });
  }, [values, sorted, yMin, yMax]);

  const path = useMemo(
    () => `M ${points.map((p) => `${p.x},${p.y}`).join(" L ")}`,
    [points]
  );

  const refLinePath = (value: number) => {
    const ratio = (value - yMin) / (yMax - yMin);
    const y = padding + innerHeight - ratio * innerHeight;
    return `M ${padding} ${y} L ${width - padding} ${y}`;
  };

  return (
    <div className="p-4 relative">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="text-sm text-zinc-400">
            Métrique:{" "}
            <span className="text-white font-medium">
              {metric.toUpperCase()}
            </span>
          </div>
          {exerciseType && (
            <div className="text-sm text-zinc-400">
              Exercice:{" "}
              <span className="text-white font-medium">{exerciseType}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs">
          <label className="flex items-center gap-1 text-zinc-400">
            <input
              type="checkbox"
              checked={showMin}
              onChange={(e) => setShowMin(e.target.checked)}
            />{" "}
            Min
          </label>
          <label className="flex items-center gap-1 text-zinc-400">
            <input
              type="checkbox"
              checked={showAvg}
              onChange={(e) => setShowAvg(e.target.checked)}
            />{" "}
            Avg
          </label>
          <label className="flex items-center gap-1 text-zinc-400">
            <input
              type="checkbox"
              checked={showMax}
              onChange={(e) => setShowMax(e.target.checked)}
            />{" "}
            Max
          </label>
        </div>
      </div>

      <svg
        width={width}
        height={height}
        className="bg-zinc-900/40 rounded-md border border-zinc-800"
      >
        {/* Axes */}
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="#3f3f46"
          strokeWidth={1}
        />
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#3f3f46"
          strokeWidth={1}
        />

        {/* Lignes de référence */}
        {showMin && (
          <path
            d={refLinePath(yMin)}
            fill="none"
            stroke="#ef4444"
            strokeWidth={1}
            strokeDasharray="5,5"
          />
        )}
        {showAvg && (
          <path
            d={refLinePath(yAvg)}
            fill="none"
            stroke="#eab308"
            strokeWidth={1}
            strokeDasharray="5,5"
          />
        )}
        {showMax && (
          <path
            d={refLinePath(yMax)}
            fill="none"
            stroke="#22c55e"
            strokeWidth={1}
            strokeDasharray="5,5"
          />
        )}

        {/* Gradient */}
        <defs>
          <linearGradient
            id="progressGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
        </defs>

        {/* Ligne principale */}
        <path
          d={path}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={2}
        />

        {/* Points */}
        {points.map((p, i) => {
          const t = i / Math.max(points.length - 1, 1);
          const r = Math.round(249 * (1 - t) + 34 * t);
          const g = Math.round(115 * (1 - t) + 197 * t);
          const b = Math.round(22 * (1 - t) + 94 * t);
          const color = `rgb(${r}, ${g}, ${b})`;

          return (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hoverIndex === i ? 5 : 3}
                fill={color}
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
                style={{ cursor: "pointer", transition: "r 0.1s" }}
              />
              {/* Tooltip minimal */}
              {hoverIndex === i && (
                <text
                  x={p.x}
                  y={p.y - 10}
                  fontSize={10}
                  textAnchor="middle"
                  fill="#fff"
                  className="pointer-events-none"
                >
                  {p.value.toFixed(2)}
                </text>
              )}
              {i % Math.ceil(sorted.length / 6) === 0 && (
                <text
                  x={p.x}
                  y={height - padding + 14}
                  fontSize={10}
                  textAnchor="middle"
                  fill="#a1a1aa"
                >
                  {formatDateLabel(p.date)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
