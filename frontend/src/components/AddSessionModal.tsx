import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Target } from 'lucide-react';

type Props = {
  playerId: string;
  onClose: () => void;
  onSuccess: () => void;
};

export default function AddSessionModal({ playerId, onClose, onSuccess }: Props) {
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const sessionDateIso = formData.session_date_local
      ? new Date(formData.session_date_local).toISOString()
      : new Date().toISOString();

    const { error: insertError } = await supabase
      .from('training_sessions')
      .insert([
        {
          player_id: playerId,
          hs_rate: parseFloat(formData.hs_rate),
          kills: parseInt(formData.kills),
          deaths: parseInt(formData.deaths),
          accuracy: parseFloat(formData.accuracy),
          map_name: formData.map_name,
          duration_minutes: parseInt(formData.duration_minutes),
          notes: formData.notes,
          session_date: sessionDateIso,
          exercise_type: formData.exercise_type,
        },
      ]);

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
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

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-zinc-950/90 backdrop-blur-xl border-2 border-zinc-800/50 rounded-lg shadow-2xl shadow-black/50 w-full max-w-2xl my-8">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-bold text-white">New Training Session</h2>
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
                <option value="">Select map</option>
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
              placeholder="Training observations and areas to improve..."
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-3 px-4 rounded-md transition font-semibold"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white py-3 px-4 rounded-md transition shadow-lg shadow-orange-600/20 font-semibold disabled:opacity-50"
            >
              {loading ? 'SAVING...' : 'SAVE SESSION'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
