-- enums_setup.sql
-- Crée/assure l'existence des 3 ENUMs :
-- 1) website_role : Admin, Coach, Joueur
-- 2) player_type : Solo, Team
-- 3) player_main_pos : In-Game Leader, Entry Fragger, Lurker, AWPer, Multiple, Support, Other
-- Sûr à ré-exécuter : crée si absent, ajoute les valeurs manquantes si présent

-- website_role
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t WHERE t.typname = 'website_role'
  ) THEN
    CREATE TYPE website_role AS ENUM ('Admin','Coach','Joueur');
  ELSE
    -- Ajoute les valeurs si elles n'existent pas déjà
    ALTER TYPE website_role ADD VALUE IF NOT EXISTS 'Admin';
    ALTER TYPE website_role ADD VALUE IF NOT EXISTS 'Coach';
    ALTER TYPE website_role ADD VALUE IF NOT EXISTS 'Joueur';
  END IF;
END $$;

-- player_type
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t WHERE t.typname = 'player_type'
  ) THEN
    CREATE TYPE player_type AS ENUM ('Solo','Team');
  ELSE
    ALTER TYPE player_type ADD VALUE IF NOT EXISTS 'Solo';
    ALTER TYPE player_type ADD VALUE IF NOT EXISTS 'Team';
  END IF;
END $$;

-- player_main_pos
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t WHERE t.typname = 'player_main_pos'
  ) THEN
    CREATE TYPE player_main_pos AS ENUM (
      'In-Game Leader',
      'Entry Fragger',
      'Lurker',
      'AWPer',
      'Multiple',
      'Support',
      'Other'
    );
  ELSE
    ALTER TYPE player_main_pos ADD VALUE IF NOT EXISTS 'In-Game Leader';
    ALTER TYPE player_main_pos ADD VALUE IF NOT EXISTS 'Entry Fragger';
    ALTER TYPE player_main_pos ADD VALUE IF NOT EXISTS 'Lurker';
    ALTER TYPE player_main_pos ADD VALUE IF NOT EXISTS 'AWPer';
    ALTER TYPE player_main_pos ADD VALUE IF NOT EXISTS 'Multiple';
    ALTER TYPE player_main_pos ADD VALUE IF NOT EXISTS 'Support';
    ALTER TYPE player_main_pos ADD VALUE IF NOT EXISTS 'Other';
  END IF;
END $$;

-- Conseils d'usage (exemples) :
-- - Pour convertir une colonne texte vers website_role :
--   ALTER TABLE public.profiles ALTER COLUMN account_type DROP DEFAULT;
--   UPDATE public.profiles SET account_type = CASE
--     WHEN account_type ILIKE 'admin' THEN 'Admin'
--     WHEN account_type ILIKE 'coach' THEN 'Coach'
--     WHEN account_type ILIKE 'joueur' OR account_type ILIKE 'player' THEN 'Joueur'
--     ELSE 'Joueur'
--   END;
--   ALTER TABLE public.profiles
--     ALTER COLUMN account_type TYPE website_role
--     USING account_type::website_role;
--   ALTER TABLE public.profiles ALTER COLUMN account_type SET DEFAULT 'Joueur'::website_role;
--
-- - Si vous préférez travailler tout en minuscules pour éviter les guillemets,
--   créez des ENUMs en minuscule (ex: website_role_l) et utilisez des valeurs
--   'admin','coach','joueur' puis adaptez vos comparaisons/RLS en conséquence.