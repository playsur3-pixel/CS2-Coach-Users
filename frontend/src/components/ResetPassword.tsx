import { useState, useEffect } from "react";
import {
  getAuth,
  confirmPasswordReset,
  verifyPasswordResetCode,
} from "firebase/auth";
import {
  Crosshair,
  Lock,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const auth = getAuth();

  // 🔍 Vérifie la validité du lien Firebase
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oobCode = params.get("oobCode");

    if (!oobCode) {
      setIsValidSession(false);
      setCheckingSession(false);
      return;
    }

    verifyPasswordResetCode(auth, oobCode)
      .then(() => setIsValidSession(true))
      .catch(() => setIsValidSession(false))
      .finally(() => setCheckingSession(false));
  }, [auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }

    try {
      const params = new URLSearchParams(window.location.search);
      const oobCode = params.get("oobCode");
      if (!oobCode) throw new Error("Lien de réinitialisation invalide");

      await confirmPasswordReset(auth, oobCode, password);
      setSuccess("✅ Mot de passe mis à jour avec succès !");
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError("❌ " + (err.message || "Une erreur est survenue"));
    } finally {
      setLoading(false);
    }
  };

  // 🌀 État “chargement de la session”
  if (checkingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black flex items-center justify-center p-4">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p>Vérification de la session...</p>
        </div>
      </div>
    );
  }

  // ❌ Lien invalide
  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black flex items-center justify-center p-4">
        <div className="bg-zinc-950/90 backdrop-blur-xl border-2 border-zinc-800/50 rounded-lg shadow-2xl shadow-black/50 w-full max-w-md p-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">
            Lien expiré ou invalide
          </h1>
          <p className="text-zinc-400 mb-6">
            {error || "Veuillez utiliser un lien de réinitialisation valide."}
          </p>
          <a
            href="/"
            className="inline-block bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-semibold py-3 px-6 rounded-md transition-all"
          >
            Retour à la connexion
          </a>
        </div>
      </div>
    );
  }

  // ✅ FORMULAIRE PRINCIPAL
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-zinc-500/5 rounded-full blur-3xl"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-zinc-950/90 backdrop-blur-xl border-2 border-zinc-800/50 rounded-lg shadow-2xl shadow-black/50">
          <div className="bg-gradient-to-r from-zinc-900 to-stone-900 p-6 border-b border-zinc-800/50 text-center">
            <div className="flex items-center justify-center mb-4">
              <Crosshair className="w-12 h-12 text-orange-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              RÉINITIALISATION
            </h1>
            <p className="text-zinc-400 text-sm">
              Définissez votre nouveau mot de passe
            </p>
          </div>

          <div className="p-6">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-md mb-4 bg-red-500/10 border border-red-500/30 text-red-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 p-3 rounded-md mb-4 bg-green-500/10 border border-green-500/30 text-green-400">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{success}</span>
              </div>
            )}

            {!success ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <PasswordField
                  label="NOUVEAU MOT DE PASSE"
                  value={password}
                  onChange={setPassword}
                  show={showPassword}
                  toggleShow={() => setShowPassword(!showPassword)}
                />

                <PasswordField
                  label="CONFIRMER LE MOT DE PASSE"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  show={showConfirmPassword}
                  toggleShow={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold py-3 px-4 rounded-md transition-all shadow-lg shadow-orange-600/20 hover:shadow-orange-600/40 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                >
                  {loading ? "MISE À JOUR..." : "METTRE À JOUR"}
                </button>
              </form>
            ) : (
              <a
                href="/"
                className="block w-full mt-4 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white text-center font-semibold py-3 px-4 rounded-md transition-all shadow-lg shadow-orange-600/20"
              >
                Retour à la connexion
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// 🔹 Sous-composant pour champ mot de passe
function PasswordField({
  label,
  value,
  onChange,
  show,
  toggleShow,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  toggleShow: () => void;
}) {
  return (
    <div>
      <label className="block text-zinc-300 text-sm font-semibold mb-2">
        {label}
      </label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-zinc-900/50 border border-zinc-700/50 rounded-md py-3 pl-11 pr-11 text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition backdrop-blur-sm"
          placeholder="••••••••"
          required
        />
        <button
          type="button"
          aria-label="Afficher ou masquer le mot de passe"
          onClick={toggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
