-- profiles_enum_migration.sql
-- Convertit public.profiles.account_type (text) vers un type enum "Role"
-- Corrige l'erreur: default for column "account_type" cannot be cast automatically to type "Role"

-- 1) Créer l'ENUM (si vous ne l'avez pas déjà)
-- ATTENTION: si vous avez déjà le type "Role", ne réexécutez pas cette ligne
-- create type "Role" as enum ('admin','coach','administrateur','entraineur','player');

-- 2) Normaliser les valeurs existantes pour qu'elles correspondent aux libellés de l'ENUM
update public.profiles
set account_type = lower(trim(account_type));

-- 3) Remplacer les valeurs invalides ou NULL par 'player'
update public.profiles
set account_type = 'player'
where account_type is null
   or lower(trim(account_type)) not in ('admin','coach','administrateur','entraineur','player');

-- 4) Supprimer le DEFAULT actuel (de type text)
alter table public.profiles alter column account_type drop default;

-- 5) Convertir la colonne vers l'ENUM "Role" avec USING (cast explicite)
alter table public.profiles
  alter column account_type type "Role"
  using lower(trim(account_type))::"Role";

-- 6) Reposer un DEFAULT valide (de type enum)
alter table public.profiles alter column account_type set default 'player'::"Role";

-- 7) (Optionnel) Vérifier distinctement les valeurs restantes
-- select distinct account_type from public.profiles;

-- Si vous préférez un type en minuscules (role_enum), utilisez ceci à la place:
-- create type role_enum as enum ('admin','coach','administrateur','entraineur','player');
-- alter table public.profiles alter column account_type drop default;
-- update public.profiles set account_type = lower(trim(account_type));
-- update public.profiles set account_type = 'player' where account_type is null or account_type not in ('admin','coach','administrateur','entraineur','player');
-- alter table public.profiles alter column account_type type role_enum using lower(trim(account_type))::role_enum;
-- alter table public.profiles alter column account_type set default 'player'::role_enum;