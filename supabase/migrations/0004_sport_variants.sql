-- Variantes de un mismo deporte (ej. Fútbol 11/7/5/Futsal, Básquet 5v5/3x3):
-- cada variante puede sumar stats propias (extra_stats) o desactivar stats
-- del deporte base que no aplican (disabled_stats). Ver lib/sports/stat-fields.ts.

alter table sports add column if not exists variants jsonb not null default '[]'::jsonb;

-- El equipo elige una variante fija del deporte al crearse (ej. "Fútbol 11").
-- Null = usa el deporte base sin variante (compatibilidad con equipos existentes).
alter table teams add column if not exists variant_key text;
