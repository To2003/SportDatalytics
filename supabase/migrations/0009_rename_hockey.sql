-- "Hockey sobre césped" envolvía mal en la UI en pantallas angostas (el
-- nombre no entraba en una sola línea junto al ícono). Se actualiza el
-- nombre existente (no un insert nuevo) para no romper el sport_id que ya
-- referencian los equipos creados.
update sports set name = 'Hockey' where name = 'Hockey sobre césped';
