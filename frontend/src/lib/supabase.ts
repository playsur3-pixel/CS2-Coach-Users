// Module supabase.ts (initialisation du client Supabase)
import { createClient } from "@supabase/supabase-js";
import { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } from "../env";

const supabaseUrl = VITE_SUPABASE_URL;
const supabaseAnonKey = VITE_SUPABASE_ANON_KEY;

// Évite les erreurs quand import.meta.env n'est pas disponible (en dehors de Vite)
const isDev =
  typeof import.meta !== "undefined" &&
  (import.meta as any)?.env &&
  Boolean((import.meta as any).env.DEV);
if (isDev) {
  console.info("[Supabase config]", {
    supabaseUrl,
    anonKeyPrefix: supabaseAnonKey?.slice(0, 12) || "(none)",
  });
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase env vars missing: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in frontend/.env"
  );
  throw new Error("Missing Supabase configuration. Check frontend/.env");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: {
      apikey: supabaseAnonKey,
    },
  },
});

export type Player = {
  id: string;
  user_id: string;
  player_name: string;
  created_at: string;
  updated_at: string;
};

export type TrainingSession = {
  id: string;
  player_id: string;
  session_date: string;
  hs_rate: number;
  kills: number;
  deaths: number;
  accuracy: number;
  map_name: string;
  duration_minutes: number;
  notes: string;
  exercise_type: string;
  created_at: string;
};

export type Profile = {
  id: string;
  email: string;
  username?: string | null;
  account_type: string;
  created_at: string;
};
