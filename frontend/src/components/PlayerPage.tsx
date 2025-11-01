import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import {
  ArrowLeft,
  Target,
  Activity,
  TrendingUp,
  Crosshair,
  Plus,
  MessageCircle,
} from "lucide-react";
import AddSessionModal from "./AddSessionModal";
import EditSessionModal from "./EditSessionModal";

// ----------------------------------------------------
// 🔸 Composant ExerciseGraph (inchangé)
// ----------------------------------------------------
function ExerciseGraph({
  sessions,
  exerciseType,
  metric,
  title,
  minValue,
  maxValue,
}: any) {
  const filteredSessions = sessions.filter((s: any) =>
    (s.exercise_type || "").toLowerCase().includes(exerciseType.toLowerCase())
  );

  if (filteredSessions.length === 0) {
    return (
      <div className="bg-zinc-950/80 backdrop-blur-xl border-2 border-zinc-800/50 rounded-lg p-6 shadow-xl shadow-black/30">
        <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
        <div className="text-zinc-500 text-center py-8">
          Aucune donnée pour cet exercice
        </div>
      </div>
    );
  }

  const values = filteredSessions.map((s: any) => {
    if (metric === "kd") {
      return s.deaths === 0 ? s.kills : s.kills / s.deaths;
    }
    return Number(s[metric]);
  });

  const minVal = minValue !== undefined ? minValue : Math.min(...values);
  const maxVal = maxValue !== undefined ? maxValue : Math.max(...values);
  const avgVal =
    values.reduce((a: number, b: number) => a + b, 0) / values.length;

  const width = 400;
  const height = 200;
  const padding = 40;
  const chartWidth = width - 2 * padding;
  const chartHeight = height - 2 * padding;

  const createPath = (vals: number[]) =>
    vals
      .map((val, i) => {
        const x = padding + (i / (vals.length - 1)) * chartWidth;
        const y =
          padding + (1 - (val - minVal) / (maxVal - minVal)) * chartHeight;
        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");

  const minPath = createPath(new Array(values.length).fill(minVal));
  const maxPath = createPath(new Array(values.length).fill(maxVal));
  const avgPath = createPath(new Array(values.length).fill(avgVal));
  const actualPath = createPath(values);

  const getProgressColor = (index: number) => {
    const progress = index / (values.length - 1);
    const r = Math.round(255 * (1 - progress) + 34 * progress);
    const g = Math.round(165 * (1 - progress) + 197 * progress);
    const b = Math.round(0 * (1 - progress) + 94 * progress);
    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <div className="bg-zinc-950/80 backdrop-blur-xl border-2 border-zinc-800/50 rounded-lg p-6 shadow-xl shadow-black/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-red-500"></div>
            <span className="text-zinc-400">Min</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-yellow-500"></div>
            <span className="text-zinc-400">Avg</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-green-500"></div>
            <span className="text-zinc-400">Max</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <svg
          width={width}
          height={height}
          className="border border-zinc-700 rounded"
        >
          <defs>
            <pattern
              id="grid"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="#374151"
                strokeWidth="0.5"
                opacity="0.3"
              />
            </pattern>
          </defs>
          <rect width={width} height={height} fill="url(#grid)" />
          <path
            d={minPath}
            stroke="#ef4444"
            strokeWidth="1"
            fill="none"
            strokeDasharray="5,5"
            opacity="0.7"
          />
          <path
            d={avgPath}
            stroke="#eab308"
            strokeWidth="1"
            fill="none"
            strokeDasharray="5,5"
            opacity="0.7"
          />
          <path
            d={maxPath}
            stroke="#22c55e"
            strokeWidth="1"
            fill="none"
            strokeDasharray="5,5"
            opacity="0.7"
          />
          <path
            d={actualPath}
            stroke="url(#progressGradient)"
            strokeWidth="3"
            fill="none"
          />
          <defs>
            <linearGradient
              id="progressGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#ff6500" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>
          {values.map((v: number, i: number) => {
            const x = padding + (i / (values.length - 1)) * chartWidth;
            const y =
              padding + (1 - (v - minVal) / (maxVal - minVal)) * chartHeight;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="4"
                fill={getProgressColor(i)}
                stroke="white"
                strokeWidth="2"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 🔸 Page principale
// ----------------------------------------------------
export default function PlayerPage({ player, onBack }: any) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddSession, setShowAddSession] = useState(false);
  const [editSessionId, setEditSessionId] = useState<string | null>(null);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    loadSessions();
  }, [player.id]);

  // 🔁 Récupération des séances depuis Firestore
  const loadSessions = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "training_sessions"),
        where("player_id", "==", player.id),
        orderBy("session_date", "asc")
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSessions(data);
    } catch (error) {
      console.error("Erreur Firestore:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAverage = (key: string) => {
    if (sessions.length === 0) return 0;
    const sum = sessions.reduce((acc, s) => acc + Number(s[key] || 0), 0);
    return (sum / sessions.length).toFixed(2);
  };

  const calculateKD = () => {
    const totalKills = sessions.reduce((a, s) => a + (s.kills || 0), 0);
    const totalDeaths = sessions.reduce((a, s) => a + (s.deaths || 0), 0);
    return totalDeaths === 0
      ? totalKills
      : (totalKills / totalDeaths).toFixed(2);
  };

  if (loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950"></div>
        <div className="text-orange-500 text-xl font-semibold relative z-10">
          Loading...
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // 🔸 Rendu principal (inchangé)
  // ----------------------------------------------------
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* (reste du JSX identique à ta version actuelle) */}
    </div>
  );
}
