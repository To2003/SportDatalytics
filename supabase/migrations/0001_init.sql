-- Esquema inicial: deportes, equipos, miembros, perfiles, partidos, convocatorias y stats.

create extension if not exists "pgcrypto";

create type member_role as enum ('coach', 'player');

create table sports (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  positions jsonb not null default '[]'::jsonb,
  stat_fields jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  sport_id uuid not null references sports (id) on delete restrict,
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role member_role not null default 'player',
  created_at timestamptz not null default now(),
  unique (team_id, user_id)
);

create table player_profiles (
  id uuid primary key default gen_random_uuid(),
  team_member_id uuid not null unique references team_members (id) on delete cascade,
  weight_kg numeric(5, 2),
  height_cm numeric(5, 2),
  position text,
  jersey_number int,
  birth_date date,
  dominant_side text
);

create table matches (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams (id) on delete cascade,
  opponent text not null,
  match_date timestamptz not null,
  location text,
  created_at timestamptz not null default now()
);

create table match_call_ups (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references matches (id) on delete cascade,
  team_member_id uuid not null references team_members (id) on delete cascade,
  unique (match_id, team_member_id)
);

create table match_stats (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references matches (id) on delete cascade,
  team_member_id uuid not null references team_members (id) on delete cascade,
  stats jsonb not null default '{}'::jsonb,
  unique (match_id, team_member_id)
);

create index teams_sport_id_idx on teams (sport_id);
create index team_members_team_id_idx on team_members (team_id);
create index team_members_user_id_idx on team_members (user_id);
create index matches_team_id_idx on matches (team_id);
create index match_call_ups_match_id_idx on match_call_ups (match_id);
create index match_stats_match_id_idx on match_stats (match_id);
