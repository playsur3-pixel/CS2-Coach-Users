import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
  const { user, signOut } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-gray-800/60 backdrop-blur rounded-xl border border-gray-700 p-6 text-center">
          <h1 className="text-2xl font-bold mb-2">Accès restreint</h1>
          <p className="text-gray-300">Veuillez vous connecter pour accéder à votre profil.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6">
      <header className="flex items-center justify-between max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold">Profil</h1>
        <button
          onClick={signOut}
          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20"
        >
          Se déconnecter
        </button>
      </header>

      <main className="max-w-5xl mx-auto mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-gray-800/60 backdrop-blur rounded-xl border border-gray-700 p-6">
            <h2 className="text-xl font-bold mb-4">Informations du compte</h2>
            <div className="space-y-2 text-gray-200">
              <p><span className="text-gray-400">Email:</span> {user.email}</p>
              <p><span className="text-gray-400">ID utilisateur:</span> {user.id}</p>
              <p><span className="text-gray-400">Statut:</span> Vérifié: {user.email_confirmed_at ? 'Oui' : 'Non'}</p>
            </div>
          </section>

          <section className="bg-gray-800/60 backdrop-blur rounded-xl border border-gray-700 p-6">
            <h2 className="text-xl font-bold mb-4">Paramètres</h2>
            <div className="space-y-3">
              <button
                onClick={signOut}
                className="w-full px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700"
              >
                Déconnexion
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}