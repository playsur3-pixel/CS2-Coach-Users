import { Users, Target, Activity, MessageCircle, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { signOut, getAuth } from "firebase/auth";
import { app } from "../lib/firebase";
import { useState } from "react";

export default function CoachDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const auth = getAuth(app);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      navigate("/"); // retour à la page de login
    } catch (err) {
      console.error("Erreur de déconnexion :", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950"></div>
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-radial from-orange-500/20 via-orange-600/10 to-transparent blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-radial from-zinc-700/20 via-stone-700/10 to-transparent blur-3xl"></div>

      {/* CONTENT */}
      <div className="relative z-10">
        {/* HEADER */}
        <header className="border-b border-orange-500/30 bg-zinc-950/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-orange-500" />
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Coach Dashboard
                </h1>
                <p className="text-xs text-zinc-400">Vue Coach</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-zinc-400 text-sm">{user?.email}</div>
              <button
                onClick={handleLogout}
                disabled={loading}
                className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium px-3 py-2 rounded-md transition disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
                {loading ? "Déconnexion..." : "Déconnexion"}
              </button>
            </div>
          </div>
        </header>

        {/* MAIN */}
        <main className="max-w-7xl mx-auto p-6">
          {/* GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Mes joueurs */}
            <div className="bg-zinc-950/80 backdrop-blur-xl border-2 border-zinc-800/50 rounded-lg p-6 shadow-xl shadow-black/30 hover:border-orange-500/40 transition">
              <div className="flex items-center justify-between mb-3">
                <Users className="w-8 h-8 text-blue-500" />
                <span className="text-xs text-zinc-500 font-semibold">
                  COACH
                </span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                Mes Joueurs
              </div>
              <p className="text-sm text-zinc-400">Liste des joueurs suivis</p>
              <button
                onClick={() => navigate("/players")}
                className="mt-4 w-full bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-md text-sm font-semibold transition"
              >
                Voir la liste
              </button>
            </div>

            {/* Analyses */}
            <div className="bg-zinc-950/80 backdrop-blur-xl border-2 border-zinc-800/50 rounded-lg p-6 shadow-xl shadow-black/30 hover:border-orange-500/40 transition">
              <div className="flex items-center justify-between mb-3">
                <Activity className="w-8 h-8 text-amber-500" />
                <span className="text-xs text-zinc-500 font-semibold">
                  PERF
                </span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">Analyses</div>
              <p className="text-sm text-zinc-400">Synthèse des performances</p>
              <button
                onClick={() => navigate("/analysis")}
                className="mt-4 w-full bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-md text-sm font-semibold transition"
              >
                Accéder
              </button>
            </div>

            {/* Messages */}
            <div className="bg-zinc-950/80 backdrop-blur-xl border-2 border-zinc-800/50 rounded-lg p-6 shadow-xl shadow-black/30 hover:border-orange-500/40 transition">
              <div className="flex items-center justify-between mb-3">
                <MessageCircle className="w-8 h-8 text-green-500" />
                <span className="text-xs text-zinc-500 font-semibold">
                  COMM
                </span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">Messages</div>
              <p className="text-sm text-zinc-400">
                Communication avec les joueurs
              </p>
              <button
                onClick={() => navigate("/messages")}
                className="mt-4 w-full bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-md text-sm font-semibold transition"
              >
                Ouvrir la messagerie
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
