-- Permite a un coach agregar miembros por email sin exponer la tabla auth.users completa.

create function public.user_id_by_email(_email text)
returns uuid
language sql
security definer
set search_path = public, auth
stable
as $$
  select id from auth.users where email = _email limit 1;
$$;

revoke all on function public.user_id_by_email(text) from public;
grant execute on function public.user_id_by_email(text) to authenticated;
