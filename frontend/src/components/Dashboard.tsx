import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Player, TrainingSession } from '../lib/supabase';
import { Crosshair, Target, Activity, TrendingUp, Plus, LogOut, Users, Eye, MessageCircle, Mail } from 'lucide-react';
import AddSessionModal from './AddSessionModal';
import AddPlayerModal from './AddPlayerModal';
import ResultsChart from './ResultsChart';
import EditSessionModal from './EditSessionModal';
import PlayerPage from './PlayerPage';
import InvitePlayerModal from './InvitePlayerModal';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [showAddSession, setShowAddSession] = useState(false);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<'hs_rate' | 'accuracy' | 'kills' | 'deaths' | 'duration_minutes' | 'kd'>('hs_rate');
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [editSessionId, setEditSessionId] = useState<string | null>(null);
  const [showPlayerPage, setShowPlayerPage] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const uniqueExercises = Array.from(new Set(sessions.map(s => s.exercise_type).filter(Boolean))) as string[];
  const roleRaw = (user?.app_metadata as any)?.role || (user?.user_metadata as any)?.role || null;
  const role = roleRaw ? String(roleRaw) : null;
  const [canInvite, setCanInvite] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Normalise et déduit la capacité d'inviter depuis différents endroits (métadatas, table profiles, Website_Users)
  useEffect(() => {
    (async () => {
      let allowed = false;
      if (role) {
        const rn = role.toLowerCase();
        if (rn === 'admin' || rn === 'coach' || rn === 'administrateur' || rn === 'entraineur') {
          allowed = true;
        }
      }
      try {
        if (user?.id) {
          const { data: profs } = await supabase
            .from('profiles')
            .select('account_type')
            .eq('id', user.id)
            .limit(1);
          const acc = profs?.[0]?.account_type;
          if (acc && ['admin', 'coach', 'administrateur', 'entraineur'].includes(String(acc).toLowerCase())) {
            allowed = true;
          }
        }
      } catch {}

      setCanInvite(allowed);
    })();
  }, [role, user?.id, user?.email]);

  useEffect(() => {
    if (canInvite && user?.id) {
      (async () => {
        try {
          const res = await fetch(`/api/notifications?recipient=${user.id}`);
          const json = await res.json();
          if (res.ok) setNotifications(json || []);
        } catch {}
      })();
    }
  }, [canInvite, user?.id]);

  async function approveRenewal(invitationId: string) {
    try {
      const res = await fetch(`/api/invitations/${invitationId}/approve-renewal`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Erreur');
      alert(`Nouveau lien: ${json.link}`);
      const res2 = await fetch(`/api/notifications?recipient=${user?.id}`);
      const json2 = await res2.json();
      if (res2.ok) setNotifications(json2 || []);
    } catch (e) {
      alert(String((e as any)?.message || e));
    }
  }

  useEffect(() => {
    loadPlayers();
  }, []);

  useEffect(() => {
    if (selectedPlayer) {
      loadSessions(selectedPlayer);
    }
  }, [selectedPlayer]);

  const loadPlayers = async () => {
    const { data } = await supabase
      .from('players')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (data) {
      setPlayers(data);
      if (data.length > 0 && !selectedPlayer) {
        setSelectedPlayer(data[0].id);
      }
    }
    setLoading(false);
  };

  const loadSessions = async (playerId: string) => {
    const { data } = await supabase
      .from('training_sessions')
      .select('*')
      .eq('player_id', playerId)
      .order('session_date', { ascending: false });

    if (data) {
      setSessions(data);
    }
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

  const selectedPlayerData = players.find(p => p.id === selectedPlayer);

  if (showPlayerPage && selectedPlayerData) {
    return (
      <PlayerPage 
        player={selectedPlayerData} 
        onBack={() => setShowPlayerPage(false)} 
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950"></div>
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-radial from-orange-500/20 via-orange-600/10 to-transparent blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-radial from-zinc-700/20 via-stone-700/10 to-transparent blur-3xl"></div>
        <div className="text-orange-500 text-xl font-semibold relative z-10">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950"></div>
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-radial from-orange-500/20 via-orange-600/10 to-transparent blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-radial from-zinc-700/20 via-stone-700/10 to-transparent blur-3xl"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iIzMzMyIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')] opacity-5"></div>

      <div className="relative z-10">
        <header className="border-b border-orange-500/30 bg-zinc-950/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crosshair className="w-8 h-8 text-orange-500" strokeWidth={2.5} />
              <div>
                <h1 className="text-2xl font-bold text-white">CS2 COACH</h1>
                <p className="text-xs text-zinc-400">Performance Tracking</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-zinc-400 text-sm">{user?.email}</span>
              {selectedPlayer && (
                <button
                  onClick={() => setShowMessage(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md flex items-center gap-2 transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Message</span>
                </button>
              )}
              <button
                onClick={() => setShowInviteModal(true)}
                className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition"
              >
                <Mail className="w-4 h-4" />
                <span>Invitation par mail</span>
              </button>
              <button
                onClick={signOut}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-md flex items-center gap-2 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Users className="w-6 h-6 text-orange-500" />
              <select
                value={selectedPlayer || ''}
                onChange={(e) => setSelectedPlayer(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-md focus:outline-none focus:border-orange-500"
              >
                {players.length === 0 && (
                  <option value="">No players yet</option>
                )}
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.player_name}
                  </option>
                ))}
              </select>
              {selectedPlayer && (
                <button
                  onClick={() => setShowPlayerPage(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md flex items-center gap-2 transition shadow-lg shadow-blue-600/30"
                >
                  <Eye className="w-5 h-5" />
                  <span>Voir profil</span>
                </button>
              )}
              <button
                onClick={() => setShowAddPlayer(true)}
                className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-md flex items-center gap-2 transition shadow-lg shadow-orange-600/30"
              >
                <Plus className="w-5 h-5" />
                <span>Recherche de joueurs</span>
              </button>
              {canInvite && (
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition"
                >
                  <Plus className="w-5 h-5" />
                  <span>Inviter un joueur</span>
                </button>
              )}
            </div>

            {selectedPlayer && (
              <button
                onClick={() => setShowAddSession(true)}
                className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white px-6 py-2 rounded-md flex items-center gap-2 transition shadow-lg shadow-orange-600/20 font-semibold"
              >
                <Plus className="w-5 h-5" />
                <span>Nouvelle séance</span>
              </button>
            )}
          </div>

          {canInvite && notifications.length > 0 && (
            <div className="mb-8 bg-zinc-950/80 backdrop-blur-xl border-2 border-zinc-800/50 rounded-lg p-4 shadow-xl">
              <h3 className="text-white font-bold mb-3">Demandes d'invitation</h3>
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div key={n.id} className="flex items-center justify-between bg-zinc-900/60 border border-zinc-800 rounded-md p-3">
                    <span className="text-zinc-200 text-sm">{n.message}</span>
                    <div className="flex gap-2">
                      {n.related_invitation_id && (
                        <button onClick={() => approveRenewal(n.related_invitation_id)} className="px-3 py-2 bg-green-600 hover:bg-green-500 text-white rounded-md text-sm">Accepter</button>
                      )}
                      <button className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md text-sm">Annuler</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedPlayer ? (
            <>
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

              <div className="bg-zinc-950/80 backdrop-blur-xl border-2 border-zinc-800/50 rounded-lg shadow-xl shadow-black/30">
                <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">Training Sessions</h2>
                    <p className="text-zinc-400 text-sm mt-1">
                      {selectedPlayerData?.player_name}'s performance history
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-zinc-400">Métrique</label>
                    <select
                      value={selectedMetric}
                      onChange={(e) => setSelectedMetric(e.target.value as any)}
                      className="bg-zinc-900 border border-zinc-800 text-white text-sm rounded-md px-2 py-1"
                    >
                      <option value="hs_rate">HS Rate</option>
                      <option value="accuracy">Accuracy</option>
                      <option value="kills">Kills</option>
                      <option value="deaths">Deaths</option>
                      <option value="duration_minutes">Durée (min)</option>
                      <option value="kd">K/D</option>
                    </select>
                    {uniqueExercises.length > 0 && (
                      <>
                        <label className="text-sm text-zinc-400 ml-3">Exercice</label>
                        <select
                          value={selectedExercise || ''}
                          onChange={(e) => setSelectedExercise(e.target.value || null)}
                          className="bg-zinc-900 border border-zinc-800 text-white text-sm rounded-md px-2 py-1"
                        >
                          <option value="">Tous</option>
                          {uniqueExercises.map(ex => (
                            <option key={ex} value={ex}>{ex}</option>
                          ))}
                        </select>
                      </>
                    )}
                  </div>
                </div>

                {/* Chart */}
                <ResultsChart sessions={sessions} metric={selectedMetric} exerciseType={selectedExercise || undefined} />

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
                          <td colSpan={8} className="px-6 py-8 text-center text-zinc-500">
                            No training sessions yet. Click "New Session" to add one.
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
                            <td className="px-6 py-4 text-sm">
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
            </>
          ) : (
            <div className="bg-zinc-950/80 backdrop-blur-xl border-2 border-zinc-800/50 rounded-lg shadow-xl shadow-black/30 p-12 text-center">
              <Users className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Players Yet</h3>
              <p className="text-zinc-400 mb-6">Add your first player to start tracking performance</p>
              <button
                onClick={() => setShowAddPlayer(true)}
                className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-3 rounded-md inline-flex items-center gap-2 transition shadow-lg shadow-orange-600/30"
              >
                <Plus className="w-5 h-5" />
                <span>Recherche de joueurs</span>
              </button>
            </div>
          )}
        </main>
      </div>

      {showAddSession && selectedPlayer && (
        <AddSessionModal
          playerId={selectedPlayer}
          onClose={() => setShowAddSession(false)}
          onSuccess={() => {
            loadSessions(selectedPlayer);
            setShowAddSession(false);
          }}
        />
      )}

      {editSessionId && (
        <EditSessionModal
          sessionId={editSessionId}
          onClose={() => setEditSessionId(null)}
          onSuccess={() => {
            if (selectedPlayer) loadSessions(selectedPlayer);
            setEditSessionId(null);
          }}
        />
      )}

      {showAddPlayer && (
        <AddPlayerModal
          onClose={() => setShowAddPlayer(false)}
          onSuccess={() => {
            loadPlayers();
            setShowAddPlayer(false);
          }}
        />
      )}

      {showInviteModal && (
        <InvitePlayerModal onClose={() => setShowInviteModal(false)} />
      )}

      {showMessage && selectedPlayerData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-950/90 backdrop-blur-xl border-2 border-zinc-800/50 rounded-lg shadow-2xl shadow-black/50 w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-6 h-6 text-blue-500" />
                <h2 className="text-xl font-bold text-white">Message à {selectedPlayerData.player_name}</h2>
              </div>
              <button
                onClick={() => setShowMessage(false)}
                className="text-zinc-400 hover:text-white transition"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <textarea
                className="w-full bg-zinc-900 border border-zinc-700 rounded-md py-3 px-4 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition resize-none"
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
