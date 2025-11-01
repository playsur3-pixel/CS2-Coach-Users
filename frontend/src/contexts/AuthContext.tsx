import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<{ error: any }>;
  resendConfirmation: (email: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          try {
            const username = (currentUser.user_metadata as any)?.playerName ?? null;
            const roleMeta = (currentUser.app_metadata as any)?.role || (currentUser.user_metadata as any)?.role || 'player';
            const accountType = roleMeta;
            await supabase
              .from('profiles')
              .upsert({ id: currentUser.id, email: currentUser.email, username, account_type: accountType }, { onConflict: 'id' });
          } catch (e) {
            console.warn('profiles upsert skipped:', (e as any)?.message ?? e);
          }
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
    const mergedMetadata = { role: 'player', ...(metadata || {}) };
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: mergedMetadata,
      },
    });
    return { error };
  };

  const resendConfirmation = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });
    return { error };
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) throw error;
    } catch (_) {
      try {
        await supabase.auth.signOut({ scope: 'local' });
      } catch {}
    } finally {
      try {
        const keys = Object.keys(localStorage);
        for (const k of keys) {
          if (k.startsWith('sb-') || k.toLowerCase().includes('supabase')) {
            localStorage.removeItem(k);
          }
        }
      } catch {}
      setUser(null);
      window.location.replace('/');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, resendConfirmation, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
