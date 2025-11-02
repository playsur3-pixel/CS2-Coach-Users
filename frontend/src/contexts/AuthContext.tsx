import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendSignInLinkToEmail,
  signOut as firebaseSignOut,
  User,
  updateProfile,
} from "firebase/auth";
import { auth } from "../lib/firebase"; // ✅ ton instance initialisée

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (
    email: string,
    password: string,
    metadata?: Record<string, any>
  ) => Promise<{ error: any }>;
  resendConfirmation: (email: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const firebaseAuth = getAuth();

  // 🔁 Surveille les changements d’état utilisateur
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, [firebaseAuth]);

  // 🔐 Connexion
  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(firebaseAuth, email, password);
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  // 🆕 Inscription + envoi mail de vérif
  const signUp = async (
    email: string,
    password: string,
    metadata?: Record<string, any>
  ) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        firebaseAuth,
        email,
        password
      );
      const newUser = userCredential.user;

      // ✅ Nom de joueur si fourni
      if (metadata?.playerName) {
        await updateProfile(newUser, { displayName: metadata.playerName });
      }

      // ✅ Envoi mail de confirmation
      await sendEmailVerification(newUser);

      setUser(newUser);
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  // 📧 Renvoyer le mail de confirmation
  const resendConfirmation = async (email: string) => {
    try {
      // Envoie un lien magique d’accès si tu veux faire un “login link”
      await sendSignInLinkToEmail(auth, email, {
        url: window.location.origin + "/",
        handleCodeInApp: true,
      });
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  // 🚪 Déconnexion
  const signOut = async () => {
    await firebaseSignOut(firebaseAuth);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        resendConfirmation,
        signOut,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
