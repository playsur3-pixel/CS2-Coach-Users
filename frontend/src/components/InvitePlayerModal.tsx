import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { X, Mail, Link as LinkIcon, CheckCircle, AlertCircle } from 'lucide-react';

type Props = {
  onClose: () => void;
};

export default function InvitePlayerModal({ onClose }: Props) {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setInviteLink(null);
    setLoading(true);

    try {
      const res = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, invitedBy: user?.id, role: 'player' }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || 'Erreur lors de la création de l\'invitation');
      }
      setInviteLink(json.link);
      setSuccess('Invitation créée ! Le lien est prêt à être envoyé.');
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setSuccess('Lien copié dans le presse-papiers.');
    } catch {}
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-white">Inviter un joueur</h2>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-red-500/10 border border-red-500/30 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-green-500/10 border border-green-500/30 text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm">{success}</span>
            </div>
          )}

          <div>
            <label className="block text-zinc-300 text-sm font-semibold mb-2">Adresse email du joueur</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-700/50 rounded-md py-3 pl-11 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20"
                placeholder="player@example.com"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold py-2 px-4 rounded-md transition disabled:opacity-50"
          >
            {loading ? 'Création...' : 'Créer l\'invitation'}
          </button>

          {inviteLink && (
            <div className="mt-4 p-3 border border-zinc-700 rounded-md bg-zinc-900/50">
              <div className="flex items-center gap-2 text-zinc-200">
                <LinkIcon className="w-5 h-5 text-orange-500" />
                <span className="text-sm break-all">{inviteLink}</span>
              </div>
              <div className="mt-2 flex gap-2">
                <button type="button" onClick={copyToClipboard} className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md text-sm">
                  Copier le lien
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}