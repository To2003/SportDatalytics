-- Row Level Security: coach = CRUD sobre su equipo, player = lectura + edición de su propio perfil físico.

alter table sports enable row level security;
alter table teams enable row level security;
alter table team_members enable row level security;
alter table player_profiles enable row level security;
alter table matches enable row level security;
alter table match_call_ups enable row level security;
alter table match_stats enable row level security;

-- Funciones security definer: evitan recursión de RLS al consultar team_members desde sus propias policies.

create function public.is_member_of_team(_team_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from team_members
    where team_id = _team_id and user_id = auth.uid()
  );
$$;

create function public.is_coach_of_team(_team_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from team_members
    where team_id = _team_id and user_id = auth.uid() and role = 'coach'
  );
$$;

create function public.is_own_team_member(_team_member_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from team_members
    where id = _team_member_id and user_id = auth.uid()
  );
$$;

create function public.is_coach_of_team_member(_team_member_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from team_members tm
    where tm.id = _team_member_id and is_coach_of_team(tm.team_id)
  );
$$;

create function public.is_coach_of_match(_match_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from matches m
    where m.id = _match_id and is_coach_of_team(m.team_id)
  );
$$;

create function public.is_member_of_match(_match_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from matches m
    where m.id = _match_id and is_member_of_team(m.team_id)
  );
$$;

-- Al crear un equipo, el creador queda automáticamente como coach.
create function public.handle_new_team()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into team_members (team_id, user_id, role)
  values (new.id, new.created_by, 'coach');
  return new;
end;
$$;

create trigger on_team_created
  after insert on teams
  for each row execute function public.handle_new_team();

-- sports: catálogo público de lectura para cualquier usuario autenticado.
create policy "sports_select_authenticated" on sports
  for select to authenticated using (true);

-- teams
create policy "teams_select_members" on teams
  for select to authenticated using (is_member_of_team(id) or created_by = auth.uid());

create policy "teams_insert_self" on teams
  for insert to authenticated with check (created_by = auth.uid());

create policy "teams_update_coach" on teams
  for update to authenticated using (is_coach_of_team(id));

create policy "teams_delete_coach" on teams
  for delete to authenticated using (is_coach_of_team(id));

-- team_members
create policy "team_members_select_members" on team_members
  for select to authenticated using (is_member_of_team(team_id));

create policy "team_members_insert_coach" on team_members
  for insert to authenticated with check (is_coach_of_team(team_id));

create policy "team_members_update_coach" on team_members
  for update to authenticated using (is_coach_of_team(team_id));

create policy "team_members_delete_coach" on team_members
  for delete to authenticated using (is_coach_of_team(team_id));

-- player_profiles
create policy "player_profiles_select_team" on player_profiles
  for select to authenticated using (
    is_coach_of_team_member(team_member_id) or is_own_team_member(team_member_id)
  );

create policy "player_profiles_insert_coach_or_self" on player_profiles
  for insert to authenticated with check (
    is_coach_of_team_member(team_member_id) or is_own_team_member(team_member_id)
  );

create policy "player_profiles_update_coach_or_self" on player_profiles
  for update to authenticated using (
    is_coach_of_team_member(team_member_id) or is_own_team_member(team_member_id)
  );

create policy "player_profiles_delete_coach" on player_profiles
  for delete to authenticated using (is_coach_of_team_member(team_member_id));

-- matches
create policy "matches_select_members" on matches
  for select to authenticated using (is_member_of_team(team_id));

create policy "matches_insert_coach" on matches
  for insert to authenticated with check (is_coach_of_team(team_id));

create policy "matches_update_coach" on matches
  for update to authenticated using (is_coach_of_team(team_id));

create policy "matches_delete_coach" on matches
  for delete to authenticated using (is_coach_of_team(team_id));

-- match_call_ups
create policy "call_ups_select_members" on match_call_ups
  for select to authenticated using (is_member_of_match(match_id));

create policy "call_ups_insert_coach" on match_call_ups
  for insert to authenticated with check (is_coach_of_match(match_id));

create policy "call_ups_delete_coach" on match_call_ups
  for delete to authenticated using (is_coach_of_match(match_id));

-- match_stats
create policy "match_stats_select_members" on match_stats
  for select to authenticated using (is_member_of_match(match_id));

create policy "match_stats_insert_coach" on match_stats
  for insert to authenticated with check (is_coach_of_match(match_id));

create policy "match_stats_update_coach" on match_stats
  for update to authenticated using (is_coach_of_match(match_id));

create policy "match_stats_delete_coach" on match_stats
  for delete to authenticated using (is_coach_of_match(match_id));
