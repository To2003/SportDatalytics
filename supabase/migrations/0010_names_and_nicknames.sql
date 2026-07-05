-- Identidad de la persona: nombre y apellido (obligatorios a nivel de app, no
-- de columna acá — hay perfiles existentes sin este dato todavía, se completa
-- una sola vez desde /profile) y un apodo default. Vive en `profiles` porque
-- es de la persona, no del equipo — se refleja en todos los equipos donde
-- participa (mismo criterio que weight_kg/height_cm/etc., ver 0007).
alter table profiles add column if not exists first_name text;
alter table profiles add column if not exists last_name text;
alter table profiles add column if not exists nickname text;

-- Apodo específico de un equipo: pisa el apodo default de `profiles` pero
-- solo dentro de ese equipo. Es de team_member (no de la persona), así que
-- va en player_profiles junto con posición/número de camiseta. Ya cubierto
-- por las policies existentes de player_profiles (coach o el propio jugador).
alter table player_profiles add column if not exists nickname text;
