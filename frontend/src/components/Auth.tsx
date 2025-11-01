import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Crosshair, Mail, Lock, AlertCircle } from "lucide-react";
import ForgotPasswordModal from "./ForgotPasswordModal";

export default function Auth() {
  const [email, setEmail] = useState(() => {
    try {
      return localStorage.getItem("lastEmail") ?? "";
    } catch {
      return "";
    }
  });
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const { signIn } = useAuth();

  useEffect(() => {
    // Met à jour le localStorage au fil de la saisie pour faciliter la prochaine connexion
    try {
      localStorage.setItem("lastEmail", email);
    } catch {}
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950"></div>
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-radial from-orange-500/20 via-orange-600/10 to-transparent blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-radial from-zinc-700/20 via-stone-700/10 to-transparent blur-3xl"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iIzMzMyIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')] opacity-5"></div>

      <img
        src="/cslogo.png"
        alt="CS2 Logo"
        className="absolute z-0 top-1/2 left-0 -translate-y-1/2 w-[125%] h-auto opacity-60 blur-[5px] pointer-events-none select-none"
      />
      <div className="w-full max-w-md relative z-10">
        <div className="relative z-10 bg-zinc-950/80 backdrop-blur-xl border-2 border-zinc-800/50 rounded-lg shadow-2xl shadow-black/50 overflow-hidden">
          <div className="bg-gradient-to-r from-zinc-900 to-stone-900 p-6 text-center border-b border-zinc-800/50">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Crosshair
                className="w-10 h-10 text-orange-500"
                strokeWidth={2.5}
              />
              <h1 className="text-3xl font-bold text-white tracking-tight">
                CS2 COACH
              </h1>
            </div>
            <p className="text-zinc-400 text-sm font-medium">
              PERFORMANCE TRACKING SYSTEM
            </p>
          </div>

          <div className="p-8">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-md mb-6 bg-red-500/10 border border-red-500/30 text-red-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-zinc-300 text-sm font-semibold mb-2">
                  EMAIL
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-700/50 rounded-md py-3 pl-11 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition backdrop-blur-sm"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 text-sm font-semibold mb-2">
                  PASSWORD
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-700/50 rounded-md py-3 pl-11 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition backdrop-blur-sm"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold py-3 px-4 rounded-md transition-all shadow-lg shadow-orange-600/20 hover:shadow-orange-600/40 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
              >
                {loading ? "CONNECTING..." : "ENTER SYSTEM"}
              </button>
            </form>

            {/* Bouton Password forget */}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-zinc-400 hover:text-orange-400 text-sm transition-colors underline"
              >
                Mot de passe oublié ?
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-zinc-600 text-sm"></div>
      </div>

      {/* Modal de mot de passe oublié */}
      <ForgotPasswordModal 
        isOpen={showForgotModal} 
        onClose={() => setShowForgotModal(false)} 
      />
    </div>
  );
}
