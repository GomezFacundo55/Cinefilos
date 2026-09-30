begin;

do $validate_layout$
begin
  if exists (
    select 1
    from public.salas s
    left join public.butacas b on b.sala_id = s.id
    group by s.id
    having count(b.id) <> 532
      or count(b.id) filter (where b.fila = 'J' and b.tipo::text = 'accesible') <> 14
      or count(b.id) filter (where b.fila = 'K' and b.tipo::text = 'accesible') <> 14
      or count(b.id) filter (where b.fila = 'E' and b.tipo::text = 'normal') <> 28
      or count(b.id) filter (where b.fila = 'F' and b.tipo::text = 'normal') <> 28
      or count(b.id) filter (where b.fila = 'G' and b.tipo::text = 'normal') <> 28
      or count(b.id) filter (where b.fila = 'H' and b.tipo::text = 'normal') <> 28
      or count(b.id) filter (where b.fila = 'I' and b.tipo::text = 'normal') <> 28
  ) then
    raise exception 'No se puede reubicar el sector accesible: cada sala debe tener 532 butacas, 14 accesibles por fila J/K y 28 normales por fila E–I.';
  end if;

  if exists (
    select 1
    from public.butacas b
    where (
      b.fila in ('J', 'K')
      and b.tipo::text <> 'accesible'
    ) or (
      b.fila in ('E', 'F', 'G', 'H', 'I')
      and b.tipo::text <> 'normal'
    )
  ) then
    raise exception 'No se puede reubicar el sector accesible: se encontraron tipos inesperados en las filas E–K.';
  end if;

  if exists (
    select 1
    from public.entradas e
    join public.butacas b on b.id = e.butaca_id
    where b.fila in ('E', 'F', 'G', 'H', 'I', 'J', 'K')
      and e.estado <> 'cancelada'::public.estado_entrada
  ) then
    raise exception 'No se puede reubicar el sector accesible mientras haya entradas no canceladas en las filas E–K.';
  end if;
end;
$validate_layout$;

update public.butacas
set fila = '__cine_layout_v2_' || fila
where fila in ('E', 'F', 'G', 'H', 'I', 'J', 'K');

update public.butacas
set fila = case fila
  when '__cine_layout_v2_J' then 'E'
  when '__cine_layout_v2_K' then 'F'
  when '__cine_layout_v2_E' then 'G'
  when '__cine_layout_v2_F' then 'H'
  when '__cine_layout_v2_G' then 'I'
  when '__cine_layout_v2_H' then 'J'
  when '__cine_layout_v2_I' then 'K'
  else fila
end,
bloque = case
  when tipo::text = 'accesible' then 2
  else bloque
end
where fila in (
  '__cine_layout_v2_E',
  '__cine_layout_v2_F',
  '__cine_layout_v2_G',
  '__cine_layout_v2_H',
  '__cine_layout_v2_I',
  '__cine_layout_v2_J',
  '__cine_layout_v2_K'
);

commit;
