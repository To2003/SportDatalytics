-- Estado y resultado de partido: el coach lo actualiza a mano (no automático
-- por fecha). `sets` solo se usa en vóley (array de {home, away} por set);
-- en el resto de los deportes queda vacío.

create type match_status as enum ('scheduled', 'live', 'finished');

alter table matches add column if not exists status match_status not null default 'scheduled';
alter table matches add column if not exists score_home int;
alter table matches add column if not exists score_away int;
alter table matches add column if not exists sets jsonb not null default '[]'::jsonb;
