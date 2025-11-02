import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { LogOut, Mail, UserCircle2, ShieldCheck } from "lucide-react";

export default function Profile() {
  const { user, signOut } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950 text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-zinc-900/70 backdrop-blur-lg border border-zinc-800/50 rounded-xl p-8 text-center shadow-lg shadow-black/50">
          <h1 className="text-2xl font-bold mb-3">Accès restreint</h1>
          <p className="text-zinc-400 mb-6">
            Vous devez être connecté pour accéder à votre profil.
          </p>
          <a
            href="/"
            className="inline-block bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-semibold py-2 px-6 rounded-md transition-all"
          >
            Retour à la connexion
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950 text-white p-6">
      <header className="flex items-center justify-between max-w-5xl mx-auto mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Mon Profil</h1>
        <button
          onClick={signOut}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 transition text-white font-semibold"
        >
          <LogOut className="w-5 h-5" />
          Déconnexion
        </button>
      </header>

      <main className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SECTION INFORMATIONS UTILISATEUR */}
        <section className="bg-zinc-900/70 backdrop-blur-lg border border-zinc-800/50 rounded-xl p-6 shadow-lg shadow-black/40">
          <div className="flex items-center gap-3 mb-4">
            <UserCircle2 className="w-7 h-7 text-orange-500" />
            <h2 className="text-xl font-bold">Informations du compte</h2>
          </div>

          <div className="space-y-3 text-zinc-300">
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-zinc-500" />
              <span>
                <span className="text-zinc-400">Email :</span> {user.email}
              </span>
            </p>

            <p className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-zinc-500" />
              <span>
                <span className="text-zinc-400">Vérifié :</span>{" "}
                {user.emailVerified ? (
                  <span className="text-green-400 font-semibold">Oui</span>
                ) : (
                  <span className="text-red-400 font-semibold">Non</span>
                )}
              </span>
            </p>

            {user.displayName && (
              <p>
                <span className="text-zinc-400">Nom d’affichage :</span>{" "}
                {user.displayName}
              </p>
            )}

            <p>
              <span className="text-zinc-400">ID utilisateur :</span>{" "}
              <span className="text-xs text-zinc-500">{user.uid}</span>
            </p>
          </div>
        </section>

        {/* SECTION PARAMÈTRES */}
        <section className="bg-zinc-900/70 backdrop-blur-lg border border-zinc-800/50 rounded-xl p-6 shadow-lg shadow-black/40">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="w-7 h-7 text-orange-500" />
            <h2 className="text-xl font-bold">Paramètres</h2>
          </div>

          <div className="space-y-3">
            <button
              onClick={signOut}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-semibold py-3 rounded-md transition-all"
            >
              <LogOut className="w-5 h-5" />
              Se déconnecter
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
