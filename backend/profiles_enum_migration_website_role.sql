-- profiles_enum_migration_website_role.sql
-- Convertit public.profiles.account_type (text) vers l'ENUM public.website_role
-- et corrige l'erreur lorsque le type n'existe pas ou que les valeurs ne correspondent pas.

-- 0) Créer l'ENUM website_role si nécessaire (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t WHERE t.typname = 'website_role'
  ) THEN
    CREATE TYPE website_role AS ENUM ('Admin','Coach','Joueur');
  ELSE
    ALTER TYPE website_role ADD VALUE IF NOT EXISTS 'Admin';
    ALTER TYPE website_role ADD VALUE IF NOT EXISTS 'Coach';
    ALTER TYPE website_role ADD VALUE IF NOT EXISTS 'Joueur';
  END IF;
END $$;

-- 1) Supprimer le DEFAULT actuel (texte) s'il existe
ALTER TABLE public.profiles ALTER COLUMN account_type DROP DEFAULT;

-- 2) Normaliser/mapping des valeurs existantes vers les libellés de l'ENUM
--   - 'admin', 'administrateur' -> 'Admin'
--   - 'coach', 'entraineur'     -> 'Coach'
--   - 'player', 'joueur', autres/NULL -> 'Joueur'
UPDATE public.profiles
SET account_type = CASE
  WHEN account_type IS NULL THEN 'Joueur'
  WHEN lower(trim(account_type)) IN ('admin','administrateur') THEN 'Admin'
  WHEN lower(trim(account_type)) IN ('coach','entraineur') THEN 'Coach'
  WHEN lower(trim(account_type)) IN ('player','joueur') THEN 'Joueur'
  ELSE 'Joueur'
END;

-- 3) Conversion de la colonne vers l'ENUM website_role avec USING (cast explicite)
ALTER TABLE public.profiles
  ALTER COLUMN account_type TYPE website_role
  USING account_type::website_role;

-- 4) Reposer un DEFAULT de type enum
ALTER TABLE public.profiles ALTER COLUMN account_type SET DEFAULT 'Joueur'::website_role;

-- 5) Vérifications (optionnel)
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles';
-- SELECT DISTINCT account_type FROM public.profiles;