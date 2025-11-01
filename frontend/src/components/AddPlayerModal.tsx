import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { X, Users } from 'lucide-react';

type Props = {
  onClose: () => void;
  onSuccess: () => void;
};

// Minimal profile type for dropdown
type ProfileItem = {
  id: string;
  email?: string | null;
  username?: string | null;
};

export default function AddPlayerModal({ onClose, onSuccess }: Props) {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<ProfileItem[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [manualName, setManualName] = useState('');

  useEffect(() => {
    // Try to load registered users from a public profiles table
    // Expect a table named 'profiles' with at least: id, email, username
    (async () => {
      setProfilesLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, username')
        .order('email', { ascending: true });

      if (error) {
        // If table does not exist or RLS forbids read, show a helpful message
        setError(
          "Impossible de charger la liste des utilisateurs. Vérifiez la table 'profiles' et les droits de lecture (RLS)."
        );
        setProfilesLoading(false);
        return;
      }

      setProfiles(data || []);
      if (data && data.length > 0) {
        setSelectedProfileId(data[0].id);
      }
      setProfilesLoading(false);
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!selectedProfileId && !manualName.trim()) {
      setError('Sélectionnez un joueur existant ou saisissez un nom de joueur.');
      setLoading(false);
      return;
    }

    const selected = profiles.find((p) => p.id === selectedProfileId);
    const playerName = manualName.trim() || selected?.username || selected?.email || 'Unknown Player';

    const { error: insertError } = await supabase
      .from('players')
      .insert([
        {
          user_id: user?.id,
          // We keep the current schema: store the chosen user's display as player_name
          // If you later add a column player_user_id (FK to profiles.id), we can insert it too
          player_name: playerName,
        },
      ]);

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
    } else {
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-950/90 backdrop-blur-xl border-2 border-zinc-800/50 rounded-lg shadow-2xl shadow-black/50 w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-bold text-white">Ajouter un joueur existant</h2>
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
            {profilesLoading ? (
              <div className="text-zinc-400 text-sm">Chargement des utilisateurs…</div>
            ) : profiles.length === 0 ? (
              <>
                <input
                  type="text"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-md py-3 px-4 text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
                  placeholder="Saisissez le nom du joueur (ex: demo)"
                />
                <p className="text-xs text-zinc-500 mt-2">
                  Aucun utilisateur listé. Saisissez manuellement le nom du joueur.
                </p>
              </>
            ) : (
              <>
                <select
                  value={selectedProfileId}
                  onChange={(e) => setSelectedProfileId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-md py-3 px-4 text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
                >
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.username || p.email || p.id}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-zinc-500 mt-2">
                  Ou laissez vide et saisissez un nom ci-dessous.
                </p>
              </>
            )}
          </div>

          {profiles.length > 0 && (
            <div className="mb-6">
              <label className="block text-zinc-300 text-sm font-semibold mb-2">NOM DU JOUEUR (optionnel)</label>
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
              disabled={loading || profilesLoading || (!selectedProfileId && !manualName.trim())}
              className="flex-1 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white py-3 px-4 rounded-md transition shadow-lg shadow-orange-600/20 font-semibold disabled:opacity-50"
            >
              {loading ? 'AJOUT…' : 'AJOUTER'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
