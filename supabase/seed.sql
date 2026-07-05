
-- Seed de deportes con stats de nivel profesional.
-- Fuente de criterio: categorías oficiales usadas por FIFA/futsal, FIH (hockey),
-- FIVB (vóley), World Rugby y FIBA.
--
-- NOTA IMPORTANTE: correr antes supabase/migrations/0004_sport_variants.sql
-- (agrega la columna `variants` a sports y `variant_key` a teams). Este seed
-- usa upsert (on conflict do update), así que si ya tenías "Fútbol" cargado
-- de una corrida anterior, esto lo actualiza con stat_fields y variants nuevos
-- en vez de dejarlo como estaba.
-- Estructura de `variants`: array de objetos { key, label, team_size, notes,
-- extra_stats?: [...], disabled_stats?: ["key1","key2"] }
-- `extra_stats` sigue el mismo formato que los items de `stat_fields`.
-- `disabled_stats` es una lista de "key" de stat_fields que no aplican a esa variante.

------------------------------------------------------------
-- 1. FÚTBOL (variantes: Fútbol 11, Fútbol 7, Fútbol 5, Futsal)
------------------------------------------------------------
insert into sports (name, positions, stat_fields, variants)
values (
  'Fútbol',
  '["Arquero", "Defensor", "Mediocampista", "Delantero"]'::jsonb,
  '[
    {"key": "goals", "label": "Goles", "type": "integer", "unit": null, "min": 0, "max": null, "order": 1},
    {"key": "assists", "label": "Asistencias", "type": "integer", "unit": null, "min": 0, "max": null, "order": 2},
    {"key": "shots_total", "label": "Remates totales", "type": "integer", "unit": null, "min": 0, "max": null, "order": 3},
    {"key": "shots_on_target", "label": "Remates al arco", "type": "integer", "unit": null, "min": 0, "max": null, "order": 4},
    {"key": "key_passes", "label": "Pases clave", "type": "integer", "unit": null, "min": 0, "max": null, "order": 5},
    {"key": "pass_accuracy_pct", "label": "% Precisión de pases", "type": "decimal", "unit": "%", "min": 0, "max": 100, "order": 6},
    {"key": "tackles_won", "label": "Entradas ganadas", "type": "integer", "unit": null, "min": 0, "max": null, "order": 7},
    {"key": "interceptions", "label": "Intercepciones", "type": "integer", "unit": null, "min": 0, "max": null, "order": 8},
    {"key": "fouls_committed", "label": "Faltas cometidas", "type": "integer", "unit": null, "min": 0, "max": null, "order": 9},
    {"key": "fouls_received", "label": "Faltas recibidas", "type": "integer", "unit": null, "min": 0, "max": null, "order": 10},
    {"key": "offsides", "label": "Offsides", "type": "integer", "unit": null, "min": 0, "max": null, "order": 11},
    {"key": "corners_taken", "label": "Córners ejecutados", "type": "integer", "unit": null, "min": 0, "max": null, "order": 12},
    {"key": "saves", "label": "Atajadas (arquero)", "type": "integer", "unit": null, "min": 0, "max": null, "order": 13},
    {"key": "goals_conceded", "label": "Goles recibidos (arquero)", "type": "integer", "unit": null, "min": 0, "max": null, "order": 14},
    {"key": "clean_sheet", "label": "Valla invicta (arquero)", "type": "boolean", "unit": null, "min": null, "max": null, "order": 15},
    {"key": "yellow_cards", "label": "Tarjetas amarillas", "type": "integer", "unit": null, "min": 0, "max": 2, "order": 16},
    {"key": "red_cards", "label": "Tarjetas rojas", "type": "integer", "unit": null, "min": 0, "max": 1, "order": 17},
    {"key": "minutes_played", "label": "Minutos jugados", "type": "integer", "unit": "min", "min": 0, "max": 120, "order": 18}
  ]'::jsonb,
  '[
    {"key": "futbol_11", "label": "Fútbol 11", "team_size": 11, "notes": "Formato estándar de cancha completa. Incluye offside."},
    {"key": "futbol_7", "label": "Fútbol 7", "team_size": 7, "notes": "Cancha reducida.", "disabled_stats": ["offsides"]},
    {"key": "futbol_5", "label": "Fútbol 5", "team_size": 5, "notes": "Cancha reducida, sin arquero fijo en algunos torneos.", "disabled_stats": ["offsides", "corners_taken"]},
    {"key": "futsal", "label": "Futsal", "team_size": 5, "notes": "Cancha techada, reglas FIFA Futsal.", "disabled_stats": ["offsides"],
      "extra_stats": [
        {"key": "accumulated_fouls", "label": "Faltas acumuladas (equipo)", "type": "integer", "unit": null, "min": 0, "max": null, "order": 19},
        {"key": "double_penalties", "label": "Dobles penales cometidos", "type": "integer", "unit": null, "min": 0, "max": null, "order": 20}
      ]
    }
  ]'::jsonb
)
on conflict (name) do update set
  positions = excluded.positions,
  stat_fields = excluded.stat_fields,
  variants = excluded.variants;

------------------------------------------------------------
-- 2. HOCKEY SOBRE CÉSPED
------------------------------------------------------------
insert into sports (name, positions, stat_fields, variants)
values (
  'Hockey',
  '["Arquero", "Defensor", "Mediocampista", "Delantero"]'::jsonb,
  '[
    {"key": "goals", "label": "Goles", "type": "integer", "unit": null, "min": 0, "max": null, "order": 1},
    {"key": "assists", "label": "Asistencias", "type": "integer", "unit": null, "min": 0, "max": null, "order": 2},
    {"key": "shots_on_target", "label": "Remates al arco", "type": "integer", "unit": null, "min": 0, "max": null, "order": 3},
    {"key": "circle_entries", "label": "Entradas al círculo", "type": "integer", "unit": null, "min": 0, "max": null, "order": 4},
    {"key": "penalty_corners_earned", "label": "Córners cortos ganados", "type": "integer", "unit": null, "min": 0, "max": null, "order": 5},
    {"key": "penalty_corners_converted", "label": "Córners cortos convertidos", "type": "integer", "unit": null, "min": 0, "max": null, "order": 6},
    {"key": "tackles_won", "label": "Entradas ganadas", "type": "integer", "unit": null, "min": 0, "max": null, "order": 7},
    {"key": "saves", "label": "Atajadas (arquero)", "type": "integer", "unit": null, "min": 0, "max": null, "order": 8},
    {"key": "goals_conceded", "label": "Goles recibidos (arquero)", "type": "integer", "unit": null, "min": 0, "max": null, "order": 9},
    {"key": "green_cards", "label": "Tarjetas verdes", "type": "integer", "unit": null, "min": 0, "max": null, "order": 10},
    {"key": "yellow_cards", "label": "Tarjetas amarillas", "type": "integer", "unit": null, "min": 0, "max": null, "order": 11},
    {"key": "red_cards", "label": "Tarjetas rojas", "type": "integer", "unit": null, "min": 0, "max": 1, "order": 12},
    {"key": "minutes_played", "label": "Minutos jugados", "type": "integer", "unit": "min", "min": 0, "max": 70, "order": 13}
  ]'::jsonb,
  '[]'::jsonb
)
on conflict (name) do update set
  positions = excluded.positions,
  stat_fields = excluded.stat_fields,
  variants = excluded.variants;

------------------------------------------------------------
-- 3. VÓLEY
------------------------------------------------------------
insert into sports (name, positions, stat_fields, variants)
values (
  'Vóley',
  '["Armador", "Opuesto", "Central", "Punta/Receptor", "Líbero"]'::jsonb,
  '[
    {"key": "attack_attempts", "label": "Intentos de ataque", "type": "integer", "unit": null, "min": 0, "max": null, "order": 1},
    {"key": "kills", "label": "Puntos de ataque", "type": "integer", "unit": null, "min": 0, "max": null, "order": 2},
    {"key": "attack_errors", "label": "Errores de ataque", "type": "integer", "unit": null, "min": 0, "max": null, "order": 3},
    {"key": "service_attempts", "label": "Saques intentados", "type": "integer", "unit": null, "min": 0, "max": null, "order": 4},
    {"key": "aces", "label": "Aces (saques directos)", "type": "integer", "unit": null, "min": 0, "max": null, "order": 5},
    {"key": "service_errors", "label": "Errores de saque", "type": "integer", "unit": null, "min": 0, "max": null, "order": 6},
    {"key": "set_assists", "label": "Asistencias (armado)", "type": "integer", "unit": null, "min": 0, "max": null, "order": 7},
    {"key": "blocks_solo", "label": "Bloqueos individuales", "type": "integer", "unit": null, "min": 0, "max": null, "order": 8},
    {"key": "blocks_assist", "label": "Bloqueos en conjunto", "type": "integer", "unit": null, "min": 0, "max": null, "order": 9},
    {"key": "block_errors", "label": "Errores de bloqueo", "type": "integer", "unit": null, "min": 0, "max": null, "order": 10},
    {"key": "digs", "label": "Defensas (digs)", "type": "integer", "unit": null, "min": 0, "max": null, "order": 11},
    {"key": "reception_attempts", "label": "Recepciones intentadas", "type": "integer", "unit": null, "min": 0, "max": null, "order": 12},
    {"key": "reception_errors", "label": "Errores de recepción", "type": "integer", "unit": null, "min": 0, "max": null, "order": 13},
    {"key": "reception_positive_pct", "label": "% Recepción positiva", "type": "decimal", "unit": "%", "min": 0, "max": 100, "order": 14},
    {"key": "sets_played", "label": "Sets jugados", "type": "integer", "unit": null, "min": 0, "max": 5, "order": 15}
  ]'::jsonb,
  '[]'::jsonb
)
on conflict (name) do update set
  positions = excluded.positions,
  stat_fields = excluded.stat_fields,
  variants = excluded.variants;

------------------------------------------------------------
-- 4. RUGBY
------------------------------------------------------------
insert into sports (name, positions, stat_fields, variants)
values (
  'Rugby',
  '["Pilar", "Hooker", "Segunda línea", "Ala", "N°8", "Medio scrum", "Apertura", "Centro", "Wing", "Fullback"]'::jsonb,
  '[
    {"key": "tries", "label": "Tries", "type": "integer", "unit": null, "min": 0, "max": null, "order": 1},
    {"key": "conversions", "label": "Conversiones", "type": "integer", "unit": null, "min": 0, "max": null, "order": 2},
    {"key": "penalty_goals", "label": "Penales convertidos", "type": "integer", "unit": null, "min": 0, "max": null, "order": 3},
    {"key": "drop_goals", "label": "Drop goals", "type": "integer", "unit": null, "min": 0, "max": null, "order": 4},
    {"key": "carries", "label": "Avances con pelota (carries)", "type": "integer", "unit": null, "min": 0, "max": null, "order": 5},
    {"key": "meters_gained", "label": "Metros ganados", "type": "integer", "unit": "m", "min": 0, "max": null, "order": 6},
    {"key": "tackles_made", "label": "Tackles hechos", "type": "integer", "unit": null, "min": 0, "max": null, "order": 7},
    {"key": "tackles_missed", "label": "Tackles fallados", "type": "integer", "unit": null, "min": 0, "max": null, "order": 8},
    {"key": "offloads", "label": "Offloads (pases en el tackle)", "type": "integer", "unit": null, "min": 0, "max": null, "order": 9},
    {"key": "turnovers_won", "label": "Turnovers ganados", "type": "integer", "unit": null, "min": 0, "max": null, "order": 10},
    {"key": "turnovers_conceded", "label": "Turnovers perdidos", "type": "integer", "unit": null, "min": 0, "max": null, "order": 11},
    {"key": "lineouts_won", "label": "Lineouts ganados", "type": "integer", "unit": null, "min": 0, "max": null, "order": 12},
    {"key": "scrums_won", "label": "Scrums ganados", "type": "integer", "unit": null, "min": 0, "max": null, "order": 13},
    {"key": "yellow_cards", "label": "Tarjetas amarillas", "type": "integer", "unit": null, "min": 0, "max": null, "order": 14},
    {"key": "red_cards", "label": "Tarjetas rojas", "type": "integer", "unit": null, "min": 0, "max": 1, "order": 15},
    {"key": "minutes_played", "label": "Minutos jugados", "type": "integer", "unit": "min", "min": 0, "max": 80, "order": 16}
  ]'::jsonb,
  '[]'::jsonb
)
on conflict (name) do update set
  positions = excluded.positions,
  stat_fields = excluded.stat_fields,
  variants = excluded.variants;

------------------------------------------------------------
-- 5. BÁSQUETBOL (variantes: 5v5 estándar y 3x3)
------------------------------------------------------------
insert into sports (name, positions, stat_fields, variants)
values (
  'Básquetbol',
  '["Base", "Escolta", "Alero", "Ala-Pívot", "Pívot"]'::jsonb,
  '[
    {"key": "points", "label": "Puntos", "type": "integer", "unit": null, "min": 0, "max": null, "order": 1},
    {"key": "fg_made", "label": "Tiros de campo convertidos", "type": "integer", "unit": null, "min": 0, "max": null, "order": 2},
    {"key": "fg_attempted", "label": "Tiros de campo intentados", "type": "integer", "unit": null, "min": 0, "max": null, "order": 3},
    {"key": "three_made", "label": "Triples convertidos", "type": "integer", "unit": null, "min": 0, "max": null, "order": 4},
    {"key": "three_attempted", "label": "Triples intentados", "type": "integer", "unit": null, "min": 0, "max": null, "order": 5},
    {"key": "ft_made", "label": "Libres convertidos", "type": "integer", "unit": null, "min": 0, "max": null, "order": 6},
    {"key": "ft_attempted", "label": "Libres intentados", "type": "integer", "unit": null, "min": 0, "max": null, "order": 7},
    {"key": "rebounds_off", "label": "Rebotes ofensivos", "type": "integer", "unit": null, "min": 0, "max": null, "order": 8},
    {"key": "rebounds_def", "label": "Rebotes defensivos", "type": "integer", "unit": null, "min": 0, "max": null, "order": 9},
    {"key": "assists", "label": "Asistencias", "type": "integer", "unit": null, "min": 0, "max": null, "order": 10},
    {"key": "steals", "label": "Robos", "type": "integer", "unit": null, "min": 0, "max": null, "order": 11},
    {"key": "blocks", "label": "Tapones", "type": "integer", "unit": null, "min": 0, "max": null, "order": 12},
    {"key": "turnovers", "label": "Pérdidas", "type": "integer", "unit": null, "min": 0, "max": null, "order": 13},
    {"key": "fouls", "label": "Faltas", "type": "integer", "unit": null, "min": 0, "max": 5, "order": 14},
    {"key": "minutes_played", "label": "Minutos jugados", "type": "integer", "unit": "min", "min": 0, "max": null, "order": 15}
  ]'::jsonb,
  '[
    {"key": "basquet_5v5", "label": "Básquet 5v5", "team_size": 5, "notes": "Formato estándar FIBA, 4 cuartos."},
    {"key": "basquet_3x3", "label": "Básquet 3x3", "team_size": 3, "notes": "Un solo aro, reglas FIBA 3x3.",
      "disabled_stats": ["fg_made", "fg_attempted", "three_made", "three_attempted", "rebounds_off", "rebounds_def"],
      "extra_stats": [
        {"key": "one_point_made", "label": "Tiros de 1 punto convertidos", "type": "integer", "unit": null, "min": 0, "max": null, "order": 16},
        {"key": "one_point_attempted", "label": "Tiros de 1 punto intentados", "type": "integer", "unit": null, "min": 0, "max": null, "order": 17},
        {"key": "two_point_made", "label": "Tiros de 2 puntos convertidos", "type": "integer", "unit": null, "min": 0, "max": null, "order": 18},
        {"key": "two_point_attempted", "label": "Tiros de 2 puntos intentados", "type": "integer", "unit": null, "min": 0, "max": null, "order": 19},
        {"key": "rebounds", "label": "Rebotes (total)", "type": "integer", "unit": null, "min": 0, "max": null, "order": 20}
      ]
    }
  ]'::jsonb
)
on conflict (name) do update set
  positions = excluded.positions,
  stat_fields = excluded.stat_fields,
  variants = excluded.variants;