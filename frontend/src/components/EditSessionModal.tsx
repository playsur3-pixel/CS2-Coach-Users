import { useEffect, useState } from "react";
import { X, Target } from "lucide-react";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

type Props = {
  sessionId: string;
  onClose: () => void;
  onSuccess: () => void;
};

// Helper pour formater en datetime-local
function toLocalInput(iso: string) {
  try {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
      d.getDate()
    )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
}

export default function EditSessionModal({
  sessionId,
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // 🔄 Charger la session Firestore
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const ref = doc(db, "training_sessions", sessionId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setFormData({
            hs_rate: data.hs_rate?.toString() ?? "",
            kills: data.kills?.toString() ?? "",
            deaths: data.deaths?.toString() ?? "",
            accuracy: data.accuracy?.toString() ?? "",
            map_name: data.map_name ?? "",
            duration_minutes: data.duration_minutes?.toString() ?? "",
            notes: data.notes ?? "",
            session_date_local: data.session_date
              ? toLocalInput(data.session_date.toDate().toISOString())
              : "",
            exercise_type: data.exercise_type ?? "",
          });
        } else {
          setError("Session introuvable.");
        }
      } catch (err: any) {
        console.error(err);
        setError("Erreur lors du chargement de la session.");
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  // 🧠 Gestion changement d’entrée
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 💾 Sauvegarde des modifications
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const ref = doc(db, "training_sessions", sessionId);
      const payload: any = {
        hs_rate: parseFloat(formData.hs_rate),
        kills: parseInt(formData.kills),
        deaths: parseInt(formData.deaths),
        accuracy: parseFloat(formData.accuracy),
        map_name: formData.map_name,
        duration_minutes: parseInt(formData.duration_minutes),
        notes: formData.notes,
        exercise_type: formData.exercise_type,
      };

      if (formData.session_date_local) {
        payload.session_date = Timestamp.fromDate(
          new Date(formData.session_date_local)
        );
      }

      await updateDoc(ref, payload);

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError("Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl w-full max-w-lg p-6 text-center text-white">
          Chargement...
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-zinc-950/90 backdrop-blur-xl border-2 border-zinc-800/50 rounded-lg shadow-2xl shadow-black/50 w-full max-w-2xl my-8">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-bold text-white">Éditer la séance</h2>
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

          {/* --- FORM --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-zinc-300 text-sm font-semibold mb-2">
                Date de session
              </label>
              <input
                type="datetime-local"
                name="session_date_local"
                value={formData.session_date_local}
                onChange={handleChange}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-md py-3 px-4 text-white"
              />
            </div>

            <div>
              <label className="block text-zinc-300 text-sm font-semibold mb-2">
                MAP
              </label>
              <select
                name="map_name"
                value={formData.map_name}
                onChange={handleChange}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-md py-3 px-4 text-white"
                required
              >
                {cs2Maps.map((map) => (
                  <option key={map} value={map}>
                    {map}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-zinc-300 text-sm font-semibold mb-2">
                TYPE D'EXERCICE
              </label>
              <select
                name="exercise_type"
                value={formData.exercise_type}
                onChange={handleChange}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-md py-3 px-4 text-white"
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

            {[
              { label: "HS Rate (%)", name: "hs_rate" },
              { label: "Accuracy (%)", name: "accuracy" },
              { label: "Kills", name: "kills" },
              { label: "Deaths", name: "deaths" },
              { label: "Durée (minutes)", name: "duration_minutes" },
            ].map(({ label, name }) => (
              <div key={name}>
                <label className="block text-zinc-300 text-sm font-semibold mb-2">
                  {label}
                </label>
                <input
                  type="number"
                  name={name}
                  value={(formData as any)[name]}
                  onChange={handleChange}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-md py-3 px-4 text-white"
                />
              </div>
            ))}
          </div>

          <div className="mb-6">
            <label className="block text-zinc-300 text-sm font-semibold mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-md py-3 px-4 text-white"
            />
          </div>

          {/* --- BUTTONS --- */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-3 px-4 rounded-md transition font-semibold"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white py-3 px-4 rounded-md transition shadow-lg shadow-orange-600/20 font-semibold disabled:opacity-50"
            >
              {saving ? "Sauvegarde..." : "Sauvegarder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
