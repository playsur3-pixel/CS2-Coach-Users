-- profiles_setup.sql
-- Option A: Table `profiles` avec RLS et exemples de données
-- Compatible Supabase (Postgres)

-- Extension nécessaire pour gen_random_uuid()
create extension if not exists pgcrypto;

-- Schéma de la table `profiles`
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  username text,
  account_type text not null default 'player',
  created_at timestamptz not null default now()
);

-- Index utile pour les recherches par email
create index if not exists profiles_email_idx on public.profiles (lower(email));

-- Activer RLS
alter table public.profiles enable row level security;

-- Supprime (si existantes) puis crée des politiques claires
-- Lecture: admins/coachs lisent tout
drop policy if exists allow_read_profiles_admins_coaches on public.profiles;
create policy allow_read_profiles_admins_coaches
  on public.profiles for select
  to authenticated
  using (
    lower(coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')) in (
      'Admin','Coach'
    )
  );

-- Lecture: chaque utilisateur lit son propre profil
drop policy if exists allow_read_own_profile on public.profiles;
create policy allow_read_own_profile
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

-- Insertion: chaque utilisateur peut créer/mettre à jour sa propre ligne (pour upsert frontend)
drop policy if exists allow_insert_own_profile on public.profiles;
create policy allow_insert_own_profile
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

-- Mise à jour: chaque utilisateur peut modifier sa propre ligne
drop policy if exists allow_update_own_profile on public.profiles;
create policy allow_update_own_profile
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Données d’exemple (exécutées en contexte owner via SQL Editor Supabase)
-- Note: ces INSERT ignorent RLS car exécutés côté serveur/owner.
insert into public.profiles (id, email, username, account_type, created_at) values
  ('8d7e3c7a-4f9d-4f3e-9a2b-1a2b3c4d5e6f','playSUR3@gmail.com', 'playSURE','admin','2025-10-24T10:00:00Z'),

-- Conseils:
-- - Assurez-vous que vos comptes Auth ont un app_metadata.role correct (admin/coach/etc.).
-- - Le frontend upsert sur `profiles` requiert les politiques INSERT/UPDATE ci-dessus.
-- - Adaptez `account_type` en enum si besoin (remplacer text par un type enum et ajuster les INSERT).