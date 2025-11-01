import { Users, Target, Activity, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function CoachDashboard() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950"></div>
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-radial from-orange-500/20 via-orange-600/10 to-transparent blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-radial from-zinc-700/20 via-stone-700/10 to-transparent blur-3xl"></div>

      <div className="relative z-10">
        <header className="border-b border-orange-500/30 bg-zinc-950/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-orange-500" />
              <div>
                <h1 className="text-2xl font-bold text-white">Coach Dashboard</h1>
                <p className="text-xs text-zinc-400">Vue Coach</p>
              </div>
            </div>
            <div className="text-zinc-400 text-sm">{user?.email}</div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-950/80 backdrop-blur-xl border-2 border-zinc-800/50 rounded-lg p-6 shadow-xl shadow-black/30">
              <div className="flex items-center justify-between mb-3">
                <Users className="w-8 h-8 text-blue-500" />
                <span className="text-xs text-zinc-500 font-semibold">COACH</span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">Mes Joueurs</div>
              <div className="text-sm text-zinc-400">Liste des joueurs suivis</div>
            </div>

            <div className="bg-zinc-950/80 backdrop-blur-xl border-2 border-zinc-800/50 rounded-lg p-6 shadow-xl shadow-black/30">
              <div className="flex items-center justify-between mb-3">
                <Activity className="w-8 h-8 text-amber-500" />
                <span className="text-xs text-zinc-500 font-semibold">PERF</span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">Analyses</div>
              <div className="text-sm text-zinc-400">Synthèse des performances</div>
            </div>

            <div className="bg-zinc-950/80 backdrop-blur-xl border-2 border-zinc-800/50 rounded-lg p-6 shadow-xl shadow-black/30">
              <div className="flex items-center justify-between mb-3">
                <MessageCircle className="w-8 h-8 text-green-500" />
                <span className="text-xs text-zinc-500 font-semibold">COMM</span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">Messages</div>
              <div className="text-sm text-zinc-400">Communication avec les joueurs</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}