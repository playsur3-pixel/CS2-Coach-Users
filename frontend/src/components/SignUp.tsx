import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Crosshair,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle,
  UserPlus,
  Eye,
  EyeOff,
} from "lucide-react";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { signUp } = useAuth();

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!playerName.trim()) {
      setError("Le nom de joueur est requis");
      setLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setError("Adresse e-mail invalide");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      setLoading(false);
      return;
    }

    const { error } = await signUp(email, password, {
      playerName,
      role: "player",
      account_type: "player",
    });

    if (error) {
      setError(error.message);
    } else {
      try {
        localStorage.setItem("lastEmail", email);
      } catch {}
      setSuccess(
        "✅ Compte créé avec succès ! Vérifiez votre email pour confirmer votre compte."
      );
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* --- BACKGROUND --- */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950"></div>
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-radial from-orange-500/20 via-orange-600/10 to-transparent blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-radial from-zinc-700/20 via-stone-700/10 to-transparent blur-3xl"></div>
      <img
        src="/cslogo.png"
        alt="CS2 Logo"
        className="absolute z-0 top-1/2 left-0 -translate-y-1/2 w-[125%] h-auto opacity-60 blur-[5px] pointer-events-none select-none"
      />

      {/* --- FORM CARD --- */}
      <div className="w-full max-w-md relative z-10">
        <div className="relative bg-zinc-950/80 backdrop-blur-xl border-2 border-zinc-800/50 rounded-lg shadow-2xl shadow-black/50 overflow-hidden">
          <div className="bg-gradient-to-r from-zinc-900 to-stone-900 p-6 text-center border-b border-zinc-800/50">
            <div className="flex items-center justify-center gap-3 mb-2">
              <UserPlus
                className="w-10 h-10 text-orange-500"
                strokeWidth={2.5}
              />
              <h1 className="text-3xl font-bold text-white tracking-tight">
                INSCRIPTION
              </h1>
            </div>
            <p className="text-zinc-400 text-sm font-medium">
              CRÉER VOTRE COMPTE JOUEUR
            </p>
          </div>

          <div className="p-8">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-md mb-6 bg-red-500/10 border border-red-500/30 text-red-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {success ? (
              <div className="text-center space-y-6">
                <div className="flex items-center justify-center gap-2 p-3 rounded-md bg-green-500/10 border border-green-500/30 text-green-400">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{success}</span>
                </div>
                <a
                  href="/"
                  className="inline-block bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-semibold py-3 px-6 rounded-md transition-all shadow-lg shadow-orange-600/20 hover:shadow-orange-600/40"
                >
                  Aller à la connexion →
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* NOM DE JOUEUR */}
                <InputField
                  label="NOM DE JOUEUR"
                  icon={<Crosshair className="w-5 h-5 text-zinc-500" />}
                  type="text"
                  value={playerName}
                  onChange={setPlayerName}
                  placeholder="Votre pseudo CS2"
                  required
                />

                {/* TYPE DE COMPTE */}
                <InputField
                  label="TYPE DE COMPTE"
                  icon={<UserPlus className="w-5 h-5 text-zinc-500" />}
                  type="text"
                  value="Joueur"
                  readOnly
                />
                <p className="text-xs text-zinc-500 mt-1">
                  Défini par défaut et non modifiable
                </p>

                {/* EMAIL */}
                <InputField
                  label="EMAIL"
                  icon={<Mail className="w-5 h-5 text-zinc-500" />}
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="you@example.com"
                  required
                />

                {/* MOT DE PASSE */}
                <PasswordField
                  label="MOT DE PASSE"
                  value={password}
                  onChange={setPassword}
                  show={showPassword}
                  toggleShow={() => setShowPassword(!showPassword)}
                />

                {/* CONFIRMATION */}
                <PasswordField
                  label="CONFIRMER LE MOT DE PASSE"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  show={showConfirmPassword}
                  toggleShow={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                />

                {/* SUBMIT */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold py-3 px-4 rounded-md transition-all shadow-lg shadow-orange-600/20 hover:shadow-orange-600/40 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                >
                  {loading ? "CRÉATION EN COURS..." : "CRÉER MON COMPTE"}
                </button>
              </form>
            )}

            {!success && (
              <div className="mt-6 text-center">
                <a
                  href="/"
                  className="text-zinc-400 hover:text-orange-400 text-sm transition-colors"
                >
                  ← Retour à la connexion
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// 🧩 Champs réutilisables

function InputField({
  label,
  icon,
  type,
  value,
  onChange,
  placeholder,
  readOnly = false,
  required = false,
}: any) {
  return (
    <div>
      <label className="block text-zinc-300 text-sm font-semibold mb-2">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          readOnly={readOnly}
          required={required}
          placeholder={placeholder}
          className={`w-full bg-zinc-900/50 border border-zinc-700/50 rounded-md py-3 pl-11 pr-4 text-white placeholder-zinc-600 focus:outline-none ${
            readOnly
              ? "opacity-70"
              : "focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20"
          } transition backdrop-blur-sm`}
        />
      </div>
    </div>
  );
}

function PasswordField({ label, value, onChange, show, toggleShow }: any) {
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
