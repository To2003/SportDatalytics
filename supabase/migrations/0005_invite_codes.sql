-- Código de invitación por equipo: el coach lo genera y lo comparte; cualquier
-- usuario autenticado puede sumarse como jugador con ese código, sin necesitar
-- que un coach conozca su email de antemano.

alter table teams add column if not exists invite_code text unique;

-- Security definer: un usuario que todavía no es miembro del equipo no tiene
-- permiso de SELECT sobre esa fila (RLS de teams_select_members), así que la
-- búsqueda por código y el alta en team_members tienen que pasar por una
-- función que corra con privilegios elevados, no por queries directas del cliente.
create function public.join_team_by_code(_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  _team_id uuid;
begin
  select id into _team_id from teams where invite_code = _code;

  if _team_id is null then
    raise exception 'Código de invitación inválido';
  end if;

  insert into team_members (team_id, user_id, role)
  values (_team_id, auth.uid(), 'player')
  on conflict (team_id, user_id) do nothing;

  return _team_id;
end;
$$;

revoke all on function public.join_team_by_code(text) from public;
grant execute on function public.join_team_by_code(text) to authenticated;
