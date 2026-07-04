-- Permite que cualquier miembro abandone un equipo por su cuenta (borra su
-- propia fila de team_members). Se suma a "team_members_delete_coach" (0002),
-- que sigue permitiendo al coach eliminar a otros miembros: Postgres evalúa
-- las policies del mismo comando con OR, así que alcanza con agregar esta.
create policy "team_members_delete_self" on team_members
  for delete to authenticated using (user_id = auth.uid());
