import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Player, TrainingSession } from '../lib/supabase';
import { ArrowLeft, Target, Activity, TrendingUp, Crosshair, Plus, MessageCircle } from 'lucide-react';
import AddSessionModal from './AddSessionModal';
import EditSessionModal from './EditSessionModal';

interface ExerciseGraphProps {
  sessions: TrainingSession[];
  exerciseType: string;
  metric: 'hs_rate' | 'accuracy' | 'kills' | 'deaths' | 'duration_minutes' | 'kd';
  title: string;
  minValue?: number;
  maxValue?: number;
}

function ExerciseGraph({ sessions, exerciseType, metric, title, minValue, maxValue }: ExerciseGraphProps) {
  const filteredSessions = sessions.filter(s => (s.exercise_type || '').toLowerCase().includes(exerciseType.toLowerCase()));
  
  if (filteredSessions.length === 0) {
    return (
      <div className="bg-zinc-950/80 backdrop-blur-xl border-2 border-zinc-800/50 rounded-lg p-6 shadow-xl shadow-black/30">
        <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
        <div className="text-zinc-500 text-center py-8">Aucune donnée pour cet exercice</div>
      </div>
    );
  }

  const values = filteredSessions.map(s => {
    if (metric === 'kd') {
      return s.deaths === 0 ? s.kills : s.kills / s.deaths;
    }
    return Number(s[metric]);
  });

  const minVal = minValue !== undefined ? minValue : Math.min(...values);
  const maxVal = maxValue !== undefined ? maxValue : Math.max(...values);
  const avgVal = values.reduce((a, b) => a + b, 0) / values.length;

  const width = 400;
  const height = 200;
  const padding = 40;
  const chartWidth = width - 2 * padding;
  const chartHeight = height - 2 * padding;

  const points = values.map((value, index) => {
    const x = padding + (index / (values.length - 1)) * chartWidth;
    const y = padding + (1 - (value - minVal) / (maxVal - minVal)) * chartHeight;
    return { x, y, value, index };
  });

  const createPath = (vals: number[]) => {
    return vals.map((val, index) => {
      const x = padding + (index / (vals.length - 1)) * chartWidth;
      const y = padding + (1 - (val - minVal) / (maxVal - minVal)) * chartHeight;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  const minPath = createPath(new Array(values.length).fill(minVal));
  const maxPath = createPath(new Array(values.length).fill(maxVal));
  const avgPath = createPath(new Array(values.length).fill(avgVal));
  const actualPath = createPath(values);

  // Couleur de progression (orange vers vert)
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
        <svg width={width} height={height} className="border border-zinc-700 rounded">
          {/* Grille */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#374151" strokeWidth="0.5" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width={width} height={height} fill="url(#grid)" />
          
          {/* Lignes de référence */}
          <path d={minPath} stroke="#ef4444" strokeWidth="1" fill="none" strokeDasharray="5,5" opacity="0.7" />
          <path d={avgPath} stroke="#eab308" strokeWidth="1" fill="none" strokeDasharray="5,5" opacity="0.7" />
          <path d={maxPath} stroke="#22c55e" strokeWidth="1" fill="none" strokeDasharray="5,5" opacity="0.7" />
          
          {/* Courbe principale avec gradient de couleur */}
          <path d={actualPath} stroke="url(#progressGradient)" strokeWidth="3" fill="none" />
          
          {/* Gradient de progression */}
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff6500" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>
          
          {/* Points */}
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="4"
              fill={getProgressColor(index)}
              stroke="white"
              strokeWidth="2"
            />
          ))}
          
          {/* Valeurs */}
          <text x={padding} y={padding - 10} fill="#9ca3af" fontSize="12">
            Max: {maxVal.toFixed(1)}
          </text>
          <text x={padding} y={height - 10} fill="#9ca3af" fontSize="12">
            Min: {minVal.toFixed(1)}
          </text>
          <text x={width - padding - 60} y={padding - 10} fill="#9ca3af" fontSize="12">
            Avg: {avgVal.toFixed(1)}
          </text>
        </svg>
      </div>
      
      <div className="mt-4 text-center text-sm text-zinc-400">
        {filteredSessions.length} séance{filteredSessions.length > 1 ? 's' : ''} • 
        Progression: {minValue !== undefined && maxValue !== undefined ? 
          `${minValue}-${maxValue}` : 
          `${minVal.toFixed(1)} → ${values[values.length - 1].toFixed(1)}`
        }
      </div>
    </div>
  );
}

interface PlayerPageProps {
  player: Player;
  onBack: () => void;
}

export default function PlayerPage({ player, onBack }: PlayerPageProps) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddSession, setShowAddSession] = useState(false);
  const [editSessionId, setEditSessionId] = useState<string | null>(null);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    loadSessions();
  }, [player.id]);

  const loadSessions = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('training_sessions')
      .select('*')
      .eq('player_id', player.id)
      .order('session_date', { ascending: true });

    if (data) {
      setSessions(data);
    }
    setLoading(false);
  };

  const calculateAverage = (key: keyof TrainingSession) => {
    if (sessions.length === 0) return 0;
    const sum = sessions.reduce((acc, s) => acc + Number(s[key]), 0);
    return (sum / sessions.length).toFixed(2);
  };

  const calculateKD = () => {
    const totalKills = sessions.reduce((acc, s) => acc + s.kills, 0);
    const totalDeaths = sessions.reduce((acc, s) => acc + s.deaths, 0);
    return totalDeaths === 0 ? totalKills : (totalKills / totalDeaths).toFixed(2);
  };

  if (loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950"></div>
        <div className="text-orange-500 text-xl font-semibold relative z-10">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950"></div>
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-radial from-orange-500/20 via-orange-600/10 to-transparent blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-radial from-zinc-700/20 via-stone-700/10 to-transparent blur-3xl"></div>

      <div className="relative z-10">
        <header className="border-b border-orange-500/30 bg-zinc-950/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="text-zinc-400 hover:text-white transition p-2 rounded-md hover:bg-zinc-800"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-3">
                <Crosshair className="w-8 h-8 text-orange-500" strokeWidth={2.5} />
                <div>
                  <h1 className="text-2xl font-bold text-white">{player.player_name}</h1>
                  <p className="text-xs text-zinc-400">Profil Joueur</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowMessage(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md flex items-center gap-2 transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Message</span>
              </button>
              <button
                onClick={() => setShowAddSession(true)}
                className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white px-4 py-2 rounded-md flex items-center gap-2 transition shadow-lg shadow-orange-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>Nouvelle séance</span>
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Stats générales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-zinc-950/80 backdrop-blur-xl border-2 border-zinc-800/50 rounded-lg p-6 shadow-xl shadow-black/30">
              <div className="flex items-center justify-between mb-3">
                <Target className="w-8 h-8 text-orange-500" />
                <span className="text-xs text-zinc-500 font-semibold">AVG</span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {calculateAverage('hs_rate')}%
              </div>
              <div className="text-sm text-zinc-400 font-medium">Headshot Rate</div>
            </div>

            <div className="bg-zinc-950/80 backdrop-blur-xl border-2 border-zinc-800/50 rounded-lg p-6 shadow-xl shadow-black/30">
              <div className="flex items-center justify-between mb-3">
                <Activity className="w-8 h-8 text-amber-500" />
                <span className="text-xs text-zinc-500 font-semibold">RATIO</span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {calculateKD()}
              </div>
              <div className="text-sm text-zinc-400 font-medium">K/D Ratio</div>
            </div>

            <div className="bg-zinc-950/80 backdrop-blur-xl border-2 border-zinc-800/50 rounded-lg p-6 shadow-xl shadow-black/30">
              <div className="flex items-center justify-between mb-3">
                <TrendingUp className="w-8 h-8 text-green-500" />
                <span className="text-xs text-zinc-500 font-semibold">AVG</span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {calculateAverage('accuracy')}%
              </div>
              <div className="text-sm text-zinc-400 font-medium">Accuracy</div>
            </div>

            <div className="bg-zinc-950/80 backdrop-blur-xl border-2 border-zinc-800/50 rounded-lg p-6 shadow-xl shadow-black/30">
              <div className="flex items-center justify-between mb-3">
                <Crosshair className="w-8 h-8 text-blue-500" />
                <span className="text-xs text-zinc-500 font-semibold">TOTAL</span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {sessions.length}
              </div>
              <div className="text-sm text-zinc-400 font-medium">Sessions</div>
            </div>
          </div>

          {/* Graphiques d'exercices */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Résultats par Exercice</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ExerciseGraph
                sessions={sessions}
                exerciseType="aim"
                metric="hs_rate"
                title="Exercice 1 - Headshot Rate"
                minValue={40}
                maxValue={120}
              />
              <ExerciseGraph
                sessions={sessions}
                exerciseType="spray"
                metric="accuracy"
                title="Exercice 2 - Accuracy"
              />
            </div>
          </div>

          {/* Tableau des séances */}
          <div className="bg-zinc-950/80 backdrop-blur-xl border-2 border-zinc-800/50 rounded-lg shadow-xl shadow-black/30">
            <div className="p-6 border-b border-zinc-800">
              <h2 className="text-xl font-bold text-white">Historique des Séances</h2>
              <p className="text-zinc-400 text-sm mt-1">
                Toutes les séances d'entraînement de {player.player_name}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Map</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Exercice</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">HS Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">K/D</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Accuracy</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {sessions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-zinc-500">
                        Aucune séance d'entraînement. Cliquez sur "Nouvelle séance" pour en ajouter une.
                      </td>
                    </tr>
                  ) : (
                    sessions.map((session) => (
                      <tr key={session.id} className="hover:bg-zinc-900/50 transition">
                        <td className="px-6 py-4 text-sm text-zinc-300">
                          {new Date(session.session_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-300 font-medium">
                          {session.map_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-300 font-medium">
                          {session.exercise_type || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="text-orange-400 font-semibold">{session.hs_rate}%</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-300">
                          {session.kills}/{session.deaths}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-green-400 font-semibold">{session.accuracy}%</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-300">
                          {session.duration_minutes}m
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                          <button
                            className="text-orange-500 hover:text-orange-400 underline"
                            onClick={() => setEditSessionId(session.id)}
                          >
                            Éditer
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      {showAddSession && (
        <AddSessionModal
          playerId={player.id}
          onClose={() => setShowAddSession(false)}
          onSuccess={() => {
            loadSessions();
            setShowAddSession(false);
          }}
        />
      )}

      {editSessionId && (
        <EditSessionModal
          sessionId={editSessionId}
          onClose={() => setEditSessionId(null)}
          onSuccess={() => {
            loadSessions();
            setEditSessionId(null);
          }}
        />
      )}

      {showMessage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-950/90 backdrop-blur-xl border-2 border-zinc-800/50 rounded-lg shadow-2xl shadow-black/50 w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <h2 className="text-xl font-bold text-white">Message à {player.player_name}</h2>
              <button
                onClick={() => setShowMessage(false)}
                className="text-zinc-400 hover:text-white transition"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <textarea
                className="w-full bg-zinc-900 border border-zinc-700 rounded-md py-3 px-4 text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition resize-none"
                rows={4}
                placeholder="Tapez votre message..."
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowMessage(false)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2 px-4 rounded-md transition"
                >
                  Annuler
                </button>
                <button
                  onClick={() => setShowMessage(false)}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-md transition"
                >
                  Envoyer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}