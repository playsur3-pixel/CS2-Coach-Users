import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Target } from 'lucide-react';
import type { TrainingSession } from '../lib/supabase';

type Props = {
  sessionId: string;
  onClose: () => void;
  onSuccess: () => void;
};

function toLocalInput(iso: string) {
  try {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  } catch {
    return '';
  }
}

export default function EditSessionModal({ sessionId, onClose, onSuccess }: Props) {
  const [formData, setFormData] = useState({
    hs_rate: '',
    kills: '',
    deaths: '',
    accuracy: '',
    map_name: '',
    duration_minutes: '',
    notes: '',
    session_date_local: '',
    exercise_type: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('training_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      const s = data as TrainingSession;
      setFormData({
        hs_rate: String(s.hs_rate ?? ''),
        kills: String(s.kills ?? ''),
        deaths: String(s.deaths ?? ''),
        accuracy: String(s.accuracy ?? ''),
        map_name: s.map_name ?? '',
        duration_minutes: String(s.duration_minutes ?? ''),
        notes: s.notes ?? '',
        session_date_local: toLocalInput(s.session_date),
        exercise_type: s.exercise_type ?? '',
      });
      setLoading(false);
    })();
  }, [sessionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    const sessionDateIso = formData.session_date_local
      ? new Date(formData.session_date_local).toISOString()
      : undefined; // keep original if not provided

    const updatePayload: any = {
      hs_rate: parseFloat(formData.hs_rate),
      kills: parseInt(formData.kills),
      deaths: parseInt(formData.deaths),
      accuracy: parseFloat(formData.accuracy),
      map_name: formData.map_name,
      duration_minutes: parseInt(formData.duration_minutes),
      notes: formData.notes,
      exercise_type: formData.exercise_type,
    };
    if (sessionDateIso) updatePayload.session_date = sessionDateIso;

    const { error: updateError } = await supabase
      .from('training_sessions')
      .update(updatePayload)
      .eq('id', sessionId);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
    } else {
      onSuccess();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const cs2Maps = [
    'Dust 2', 'Mirage', 'Inferno', 'Nuke', 'Overpass',
    'Vertigo', 'Ancient', 'Anubis', 'Train', 'Cache'
  ];

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl w-full max-w-lg p-6 text-center text-white">Chargement...</div>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-zinc-300 text-sm font-semibold mb-2">Date de session</label>
              <input
                type="datetime-local"
                name="session_date_local"
                value={formData.session_date_local}
                onChange={handleChange}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-md py-3 px-4 text-white"
              />
            </div>
            <div>
              <label className="block text-zinc-300 text-sm font-semibold mb-2">MAP</label>
              <select
                name="map_name"
                value={formData.map_name}
                onChange={handleChange}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-md py-3 px-4 text-white"
                required
              >
                {cs2Maps.map((map) => (
                  <option key={map} value={map}>{map}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-zinc-300 text-sm font-semibold mb-2">TYPE D'EXERCICE</label>
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
            <div>
              <label className="block text-zinc-300 text-sm font-semibold mb-2">HS Rate (%)</label>
              <input type="number" name="hs_rate" step="0.01" value={formData.hs_rate} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-700 rounded-md py-3 px-4 text-white" />
            </div>
            <div>
              <label className="block text-zinc-300 text-sm font-semibold mb-2">Accuracy (%)</label>
              <input type="number" name="accuracy" step="0.01" value={formData.accuracy} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-700 rounded-md py-3 px-4 text-white" />
            </div>
            <div>
              <label className="block text-zinc-300 text-sm font-semibold mb-2">Kills</label>
              <input type="number" name="kills" value={formData.kills} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-700 rounded-md py-3 px-4 text-white" />
            </div>
            <div>
              <label className="block text-zinc-300 text-sm font-semibold mb-2">Deaths</label>
              <input type="number" name="deaths" value={formData.deaths} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-700 rounded-md py-3 px-4 text-white" />
            </div>
            <div>
              <label className="block text-zinc-300 text-sm font-semibold mb-2">Durée (minutes)</label>
              <input type="number" name="duration_minutes" value={formData.duration_minutes} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-700 rounded-md py-3 px-4 text-white" />
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-zinc-300 text-sm font-semibold mb-2">Notes</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="w-full bg-zinc-900 border border-zinc-700 rounded-md py-3 px-4 text-white" />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-3 px-4 rounded-md transition font-semibold">Annuler</button>
            <button type="submit" disabled={saving} className="flex-1 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white py-3 px-4 rounded-md transition shadow-lg shadow-orange-600/20 font-semibold disabled:opacity-50">
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}