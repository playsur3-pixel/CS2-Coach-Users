import { useState } from "react";
import { X, Target } from "lucide-react";
// import { db } from "../lib/firebase"; // décommente quand Firestore sera branché
// import { addDoc, collection, Timestamp } from "firebase/firestore";

type Props = {
  playerId: string;
  onClose: () => void;
  onSuccess: () => void;
};

export default function AddSessionModal({
  playerId,
  onClose,
  onSuccess,
}: Props) {
  const [formData, setFormData] = useState({
    hs_rate: "",
    kills: "",
    deaths: "",
    accuracy: "",
    map_name: "",
    duration_minutes: "",
    notes: "",
    session_date_local: "",
    exercise_type: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🧠 Gestion du changement de champ
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 💾 Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (
        !formData.hs_rate ||
        !formData.kills ||
        !formData.deaths ||
        !formData.map_name
      ) {
        throw new Error("Veuillez remplir tous les champs obligatoires.");
      }

      // Exemple de sauvegarde Firestore :
      /*
      await addDoc(collection(db, "training_sessions"), {
        player_id: playerId,
        ...formData,
        hs_rate: Number(formData.hs_rate),
        accuracy: Number(formData.accuracy),
        kills: Number(formData.kills),
        deaths: Number(formData.deaths),
        duration_minutes: Number(formData.duration_minutes),
        created_at: Timestamp.now(),
      });
      */

      console.log("✅ Session saved:", formData);

      onSuccess(); // refresh parent
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erreur lors de la sauvegarde de la session.");
    } finally {
      setLoading(false);
    }
  };

  const cs2Maps = [
    "Dust 2",
    "Mirage",
    "Inferno",
    "Nuke",
    "Overpass",
    "Vertigo",
    "Ancient",
    "Anubis",
    "Train",
    "Cache",
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-zinc-950/90 backdrop-blur-xl border-2 border-zinc-800/50 rounded-lg shadow-2xl shadow-black/50 w-full max-w-2xl my-8">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-bold text-white">
              Nouvelle séance d'entraînement
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

          {/* FORMULAIRE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Headshot rate */}
            <div>
              <label className="block text-zinc-300 text-sm font-semibold mb-2">
                HEADSHOT RATE (%)
              </label>
              <input
                type="number"
                name="hs_rate"
                value={formData.hs_rate}
                onChange={handleChange}
                step="0.01"
                min="0"
                max="100"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-md py-3 px-4 text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
                placeholder="45.5"
                required
              />
            </div>

            {/* Accuracy */}
            <div>
              <label className="block text-zinc-300 text-sm font-semibold mb-2">
                ACCURACY (%)
              </label>
              <input
                type="number"
                name="accuracy"
                value={formData.accuracy}
                onChange={handleChange}
                step="0.01"
                min="0"
                max="100"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-md py-3 px-4 text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
                placeholder="32.5"
                required
              />
            </div>

            {/* Kills */}
            <div>
              <label className="block text-zinc-300 text-sm font-semibold mb-2">
                KILLS
              </label>
              <input
                type="number"
                name="kills"
                value={formData.kills}
                onChange={handleChange}
                min="0"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-md py-3 px-4 text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
                placeholder="25"
                required
              />
            </div>

            {/* Deaths */}
            <div>
              <label className="block text-zinc-300 text-sm font-semibold mb-2">
                DEATHS
              </label>
              <input
                type="number"
                name="deaths"
                value={formData.deaths}
                onChange={handleChange}
                min="0"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-md py-3 px-4 text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
                placeholder="18"
                required
              />
            </div>

            {/* Map */}
            <div>
              <label className="block text-zinc-300 text-sm font-semibold mb-2">
                MAP
              </label>
              <select
                name="map_name"
                value={formData.map_name}
                onChange={handleChange}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-md py-3 px-4 text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
                required
              >
                <option value="">Sélectionner une map</option>
                {cs2Maps.map((map) => (
                  <option key={map} value={map}>
                    {map}
                  </option>
                ))}
              </select>
            </div>

            {/* Exercice */}
            <div>
              <label className="block text-zinc-300 text-sm font-semibold mb-2">
                TYPE D'EXERCICE
              </label>
              <select
                name="exercise_type"
                value={formData.exercise_type}
                onChange={handleChange}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-md py-3 px-4 text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
                required
              >
                <option value="">Sélectionner un exercice</option>
                <option value="aim_training">Aim Training</option>
                <option value="spray_control">Spray Control</option>
                <option value="movement">Movement</option>
                <option value="positioning">Positioning</option>
                <option value="game_sense">Game Sense</option>
                <option value="clutch">Clutch</option>
                <option value="retake">Retake</option>
                <option value="deathmatch">Deathmatch</option>
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-zinc-300 text-sm font-semibold mb-2">
                DURATION (minutes)
              </label>
              <input
                type="number"
                name="duration_minutes"
                value={formData.duration_minutes}
                onChange={handleChange}
                min="0"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-md py-3 px-4 text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
                placeholder="60"
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-zinc-300 text-sm font-semibold mb-2">
              NOTES
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-md py-3 px-4 text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition resize-none"
              placeholder="Observations ou points d'amélioration..."
            />
          </div>

          {/* Boutons */}
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
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white py-3 px-4 rounded-md transition shadow-lg shadow-orange-600/20 font-semibold disabled:opacity-50"
            >
              {loading ? "ENREGISTREMENT..." : "SAUVEGARDER"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
