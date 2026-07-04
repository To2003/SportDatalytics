-- Peso/altura/fecha de nacimiento/lateralidad pasan de "uno por equipo" (vivían
-- en player_profiles, una fila por team_member) a "uno por persona" — así
-- editarlos desde /profile se refleja en todos los equipos donde participás.
-- player_profiles se queda solo con lo que sí es específico del equipo:
-- posición y número de camiseta.

create table profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  weight_kg numeric(5, 2),
  height_cm numeric(5, 2),
  birth_date date,
  dominant_side text,
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

-- Backfill: para cada persona, toma los datos físicos del team_member con el
-- alta más reciente que tuviera player_profile cargado. El resto de las copias
-- (si había valores distintos en otros equipos) se descarta.
insert into profiles (user_id, weight_kg, height_cm, birth_date, dominant_side)
select distinct on (tm.user_id)
  tm.user_id, pp.weight_kg, pp.height_cm, pp.birth_date, pp.dominant_side
from player_profiles pp
join team_members tm on tm.id = pp.team_member_id
order by tm.user_id, tm.created_at desc
on conflict (user_id) do nothing;

alter table player_profiles drop column if exists weight_kg;
alter table player_profiles drop column if exists height_cm;
alter table player_profiles drop column if exists birth_date;
alter table player_profiles drop column if exists dominant_side;

-- Un coach puede ver/editar el perfil físico de cualquier jugador con el que
-- comparta equipo (mismo criterio que ya usábamos vía team_member_id, ahora
-- aplicado directo sobre user_id ya que profiles no pasa por team_members).
create function public.is_coach_of_user(_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from team_members coach_tm
    join team_members player_tm on player_tm.team_id = coach_tm.team_id
    where coach_tm.user_id = auth.uid()
      and coach_tm.role = 'coach'
      and player_tm.user_id = _user_id
  );
$$;

create policy "profiles_select_self_or_coach" on profiles
  for select to authenticated using (user_id = auth.uid() or is_coach_of_user(user_id));

create policy "profiles_insert_self_or_coach" on profiles
  for insert to authenticated with check (user_id = auth.uid() or is_coach_of_user(user_id));

create policy "profiles_update_self_or_coach" on profiles
  for update to authenticated using (user_id = auth.uid() or is_coach_of_user(user_id));
