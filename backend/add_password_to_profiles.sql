-- add_password_to_profiles.sql
-- Ajoute une colonne de mot de passe (hash) à public.profiles
-- et crée une vue qui l'affiche juste après l'email.
-- Recommandation: ne pas stocker les mots de passe en clair.
-- Utilisez pgcrypto (crypt/gen_salt) pour stocker un hash.

BEGIN;

-- Assure l'extension pour le hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Colonne recommandée: password_hash (type text)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS password_hash text;

-- Vue d'affichage avec l'ordre souhaité (password après email)
CREATE OR REPLACE VIEW public.profiles_view AS
SELECT
  id,
  email,
  password_hash,
  username,
  account_type,
  created_at
FROM public.profiles;

COMMIT;

-- Exemples d'usage (exécuter séparément si besoin):
-- UPDATE public.profiles
--   SET password_hash = crypt('motdepasse_en_clair', gen_salt('bf'))
--   WHERE email = 'user@example.com';
--
-- Vérifier: SELECT id, email, password_hash FROM public.profiles_view;
--
-- Note RLS: évitez de retourner password_hash au frontend.
-- Si vous souhaitez un accès administrateur sans exposer password_hash,
-- interrogez la vue en excluant cette colonne ou créez une vue dédiée.