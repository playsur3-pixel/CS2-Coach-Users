import { useEffect, useState } from 'react';
import { Users, Calendar, Mail, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import InviteModal from '../components/InviteModal';

interface UserWithLastSession extends Profile {
  last_session_date: string | null;
}

export default function AdminDashboard() {
  const { profile, signOut } = useAuth();
  const [coaches, setCoaches] = useState<UserWithLastSession[]>([]);
  const [players, setPlayers] = useState<UserWithLastSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);


  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Aucune session';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-slate-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Tableau de bord Admin</h1>
            <p className="text-sm text-slate-600 mt-1">Bienvenue, {profile?.pseudo}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Inviter un joueur
            </button>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-emerald-100 rounded-lg">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Coachs</h2>
                <p className="text-sm text-slate-500">{coaches.length} coach(s) inscrits</p>
              </div>
            </div>

            <div className="space-y-3">
              {coaches.length === 0 ? (
                <p className="text-slate-500 text-center py-8">Aucun coach inscrit</p>
              ) : (
                coaches.map((coach) => (
                  <div
                    key={coach.id}
                    className="p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-emerald-200 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {coach.pseudo.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{coach.pseudo}</p>
                          <p className="text-sm text-slate-500">{coach.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-slate-600 text-sm">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(coach.last_session_date)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Joueurs</h2>
                <p className="text-sm text-slate-500">{players.length} joueur(s) inscrits</p>
              </div>
            </div>

            <div className="space-y-3">
              {players.length === 0 ? (
                <p className="text-slate-500 text-center py-8">Aucun joueur inscrit</p>
              ) : (
                players.map((player) => (
                  <div
                    key={player.id}
                    className="p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-200 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {player.pseudo.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{player.pseudo}</p>
                          <p className="text-sm text-slate-500">{player.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-slate-600 text-sm">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(player.last_session_date)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {showInviteModal && (
        <InviteModal
          onClose={() => setShowInviteModal(false)}
          onInviteSent={() => {
            setShowInviteModal(false);
          }}
        />
      )}
    </div>
  );
}
