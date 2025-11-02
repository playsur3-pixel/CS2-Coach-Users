import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { X, Users } from "lucide-react";

type Props = {
  onClose: () => void;
  onSuccess: (playerName?: string) => void;
};

type PlayerItem = {
  id: string;
  email?: string | null;
  displayName?: string | null;
};

export default function AddPlayerModal({ onClose, onSuccess }: Props) {
  const { user } = useAuth();
  const [players, setPlayers] = useState<PlayerItem[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [manualName, setManualName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [playersLoading, setPlayersLoading] = useState(true);

  // Exemple de récupération de comptes joueurs (optionnel : Firestore)
  useEffect(() => {
    async function fetchPlayers() {
      try {
        setPlayersLoading(true);
        // 🔹 Ici, tu pourras brancher Firebase (ex: Firestore)
        // const snapshot = await getDocs(collection(db, "players"));
        // setPlayers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Pour l’instant : faux exemple de data
        setPlayers([
          { id: "1", displayName: "DemoPlayer", email: "demo@site.com" },
          { id: "2", displayName: "Player2", email: "player2@site.com" },
        ]);
      } catch (err) {
        console.error(err);
        setError("Erreur lors du chargement des joueurs.");
      } finally {
        setPlayersLoading(false);
      }
    }
    fetchPlayers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!selectedPlayerId && !manualName.trim()) {
      setError("Sélectionnez un joueur existant ou saisissez un nom.");
      setLoading(false);
      return;
    }

    const selected = players.find((p) => p.id === selectedPlayerId);
    const playerName =
      manualName.trim() ||
      selected?.displayName ||
      selected?.email ||
      "Joueur inconnu";

    try {
      // 🔹 Ici, tu pourras plus tard créer une entrée Firestore
      // await addDoc(collection(db, "linked_players"), {
      //   coachId: user?.uid,
      //   playerName,
      //   playerId: selectedPlayerId || null,
      // });

      console.log("✅ Joueur ajouté :", playerName);
      onSuccess(playerName);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Erreur lors de l’ajout du joueur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-950/90 backdrop-blur-xl border-2 border-zinc-800/50 rounded-lg shadow-2xl shadow-black/50 w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-bold text-white">
              Ajouter un joueur existant
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-md mb-4 text-sm">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-zinc-300 text-sm font-semibold mb-2">
              UTILISATEUR (inscrit sur le site)
            </label>
            {playersLoading ? (
              <div className="text-zinc-400 text-sm">
                Chargement des utilisateurs…
              </div>
            ) : players.length === 0 ? (
              <>
                <input
                  type="text"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-md py-3 px-4 text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
                  placeholder="Saisissez le nom du joueur (ex: demo)"
                />
                <p className="text-xs text-zinc-500 mt-2">
                  Aucun utilisateur listé. Saisissez manuellement un nom.
                </p>
              </>
            ) : (
              <>
                <select
                  value={selectedPlayerId}
                  onChange={(e) => setSelectedPlayerId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-md py-3 px-4 text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
                >
                  <option value="">-- Sélectionner un joueur --</option>
                  {players.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.displayName || p.email || p.id}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-zinc-500 mt-2">
                  Ou laissez vide et saisissez un nom ci-dessous.
                </p>
              </>
            )}
          </div>

          {players.length > 0 && (
            <div className="mb-6">
              <label className="block text-zinc-300 text-sm font-semibold mb-2">
                NOM DU JOUEUR (optionnel)
              </label>
              <input
                type="text"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-md py-3 px-4 text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
                placeholder="Saisissez un alias à afficher"
              />
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-3 px-4 rounded-md transition font-semibold"
            >
              ANNULER
            </button>
            <button
              type="submit"
              disabled={
                loading ||
                playersLoading ||
                (!selectedPlayerId && !manualName.trim())
              }
              className="flex-1 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white py-3 px-4 rounded-md transition shadow-lg shadow-orange-600/20 font-semibold disabled:opacity-50"
            >
              {loading ? "AJOUT…" : "AJOUTER"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
