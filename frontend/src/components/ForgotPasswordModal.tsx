import { useState } from "react";
import { X, Mail, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "../lib/supabase";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage("Un email de réinitialisation a été envoyé à votre adresse !");
        setEmail("");
      }
    } catch (err: any) {
      setError("Une erreur est survenue lors de l'envoi de l'email.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setError("");
    setMessage("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-950/90 backdrop-blur-xl border-2 border-zinc-800/50 rounded-lg shadow-2xl shadow-black/50 w-full max-w-md">
        <div className="bg-gradient-to-r from-zinc-900 to-stone-900 p-4 border-b border-zinc-800/50 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Mot de passe oublié</h2>
          <button
            onClick={handleClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-md mb-4 bg-red-500/10 border border-red-500/30 text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {message && (
            <div className="flex items-center gap-2 p-3 rounded-md mb-4 bg-green-500/10 border border-green-500/30 text-green-400">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-zinc-300 text-sm font-semibold mb-2">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-700/50 rounded-md py-3 pl-11 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition backdrop-blur-sm"
                  placeholder="votre@email.com"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-3 px-4 rounded-md transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-semibold py-3 px-4 rounded-md transition-all shadow-lg shadow-orange-600/20 hover:shadow-orange-600/40 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Envoi..." : "Envoyer"}
              </button>
            </div>
          </form>

          <p className="text-zinc-500 text-xs mt-4 text-center">
            Vous recevrez un email avec un lien pour réinitialiser votre mot de passe.
          </p>
        </div>
      </div>
    </div>
  );
}