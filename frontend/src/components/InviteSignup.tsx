import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Crosshair,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle,
  UserPlus,
  RefreshCcw,
} from "lucide-react";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";

export default function InviteSignup() {
  const { signUp } = useAuth();
  const [invitation, setInvitation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 🔍 Récupère le token dans l’URL
  const token = new URLSearchParams(window.location.search).get("invite") || "";

  // 🔄 Récupération de l’invitation Firestore
  useEffect(() => {
    const fetchInvitation = async () => {
      setLoading(true);
      setError("");

      try {
        const q = query(
          collection(db, "invitations"),
          where("token", "==", token)
        );
        const snap = await getDocs(q);

        if (snap.empty) {
          setError("Invitation introuvable ou invalide.");
          return;
        }

        const data = { id: snap.docs[0].id, ...snap.docs[0].data() };
        const now = Timestamp.now();

        // Vérifie expiration (7 jours par exemple)
        const expired =
          data.used ||
          (data.createdAt &&
            now.seconds - data.createdAt.seconds > 60 * 60 * 24 * 7);

        setInvitation({ ...data, expired });
      } catch (err: any) {
        console.error(err);
        setError("Erreur lors du chargement de l’invitation.");
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [token]);

  // ✍️ Création du compte
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!invitation || invitation.expired) {
      setError("Cette invitation n’est plus valide.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (!playerName.trim()) {
      setError("Veuillez saisir un nom de joueur.");
      return;
    }

    try {
      const { error } = await signUp(invitation.email, password, {
        playerName,
        role: "player",
        account_type: "player",
      });

      if (error) throw new Error(error.message);

      setSuccess("✅ Compte créé ! Vérifiez votre email pour confirmation.");

      // 🔁 Marque l’invitation comme utilisée
      await updateDoc(doc(db, "invitations", invitation.id), {
        used: true,
        usedAt: Timestamp.now(),
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erreur lors de la création du compte.");
    }
  };

  // 🔁 Demande de nouveau lien (optionnel)
  const requestRenewal = async () => {
    setError("");
    setSuccess(
      "Demande envoyée. Le coach sera notifié pour renouveler votre lien."
    );
  };

  // ---------------------------------------------------
  // 🌀 ÉTATS SPÉCIAUX
  // ---------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950"></div>
        <div className="text-orange-500 text-xl font-semibold relative z-10">
          Chargement...
        </div>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <div className="p-6 border border-zinc-800 rounded-lg bg-zinc-900">
          Invitation introuvable
        </div>
      </div>
    );
  }

  if (invitation.expired) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950"></div>
        <div className="w-full max-w-md relative z-10">
          <div className="bg-zinc-950/80 backdrop-blur-xl border-2 border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="p-6 text-center border-b border-zinc-800/50">
              <div className="flex items-center justify-center gap-3 mb-2">
                <RefreshCcw
                  className="w-10 h-10 text-orange-500"
                  strokeWidth={2.5}
                />
                <h1 className="text-2xl font-bold text-white">Lien expiré</h1>
              </div>
              <p className="text-zinc-400 text-sm">
                Demandez la génération d’un nouveau lien d’invitation.
              </p>
            </div>
            <div className="p-6">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-md mb-4 bg-red-500/10 border border-red-500/30 text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2 p-3 rounded-md mb-4 bg-green-500/10 border border-green-500/30 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm">{success}</span>
                </div>
              )}
              <button
                onClick={requestRenewal}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold py-3 px-4 rounded-md transition-all"
              >
                Demander un nouveau lien
              </button>
              <div className="mt-6 text-center">
                <a
                  href="/"
                  className="text-zinc-400 hover:text-orange-400 text-sm transition-colors"
                >
                  ← Retour
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------
  // 🧠 FORMULAIRE D’INSCRIPTION
  // ---------------------------------------------------
  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950"></div>
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-radial from-orange-500/20 via-orange-600/10 to-transparent blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-radial from-zinc-700/20 via-stone-700/10 to-transparent blur-3xl"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-zinc-950/80 backdrop-blur-xl border-2 border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-zinc-900 to-stone-900 p-6 text-center border-b border-zinc-800/50">
            <div className="flex items-center justify-center gap-3 mb-2">
              <UserPlus
                className="w-10 h-10 text-orange-500"
                strokeWidth={2.5}
              />
              <h1 className="text-3xl font-bold text-white tracking-tight">
                INSCRIPTION (INVITATION)
              </h1>
            </div>
            <p className="text-zinc-400 text-sm font-medium">
              Créez votre compte joueur
            </p>
          </div>

          <div className="p-8">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-md mb-6 bg-red-500/10 border border-red-500/30 text-red-400">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{error}</span>
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 p-3 rounded-md mb-6 bg-green-500/10 border border-green-500/30 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm">{success}</span>
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-5">
              <div>
                <label className="block text-zinc-300 text-sm font-semibold mb-2">
                  EMAIL (verrouillé)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="email"
                    value={invitation.email}
                    readOnly
                    className="w-full bg-zinc-900/50 border border-zinc-700/50 rounded-md py-3 pl-11 pr-4 text-white opacity-70"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 text-sm font-semibold mb-2">
                  TYPE DE COMPTE
                </label>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="text"
                    value="Joueur"
                    readOnly
                    className="w-full bg-zinc-900/50 border border-zinc-700/50 rounded-md py-3 pl-11 pr-4 text-white opacity-70"
                  />
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  Défini par le coach et non modifiable
                </p>
              </div>

              <div>
                <label className="block text-zinc-300 text-sm font-semibold mb-2">
                  NOM DE JOUEUR
                </label>
                <div className="relative">
                  <Crosshair className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-700/50 rounded-md py-3 pl-11 pr-4 text-white"
                    placeholder="Ex: sharpshooter"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 text-sm font-semibold mb-2">
                  MOT DE PASSE
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-700/50 rounded-md py-3 pl-11 pr-4 text-white"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 text-sm font-semibold mb-2">
                  CONFIRMER LE MOT DE PASSE
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-700/50 rounded-md py-3 pl-11 pr-4 text-white"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!!success}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold py-3 px-4 rounded-md transition-all disabled:opacity-50"
              >
                Créer mon compte
              </button>
            </form>

            <div className="mt-6 text-center">
              <a
                href="/"
                className="text-zinc-400 hover:text-orange-400 text-sm transition-colors"
              >
                ← Retour
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
