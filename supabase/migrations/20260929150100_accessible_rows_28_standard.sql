begin;

do $validate_layout$
declare
  sala record;
  total_butacas bigint;
  accesibles_e bigint;
  accesibles_f bigint;
  accesibles_e_distintas bigint;
  accesibles_f_distintas bigint;
  accesibles_e_min integer;
  accesibles_e_max integer;
  accesibles_f_min integer;
  accesibles_f_max integer;
begin
  for sala in select id from public.salas loop
    select count(*) into total_butacas
    from public.butacas
    where sala_id = sala.id;

    select count(*), count(distinct numero), min(numero), max(numero)
      into accesibles_e, accesibles_e_distintas, accesibles_e_min, accesibles_e_max
    from public.butacas
    where sala_id = sala.id and fila = 'E' and tipo::text = 'accesible';

    select count(*), count(distinct numero), min(numero), max(numero)
      into accesibles_f, accesibles_f_distintas, accesibles_f_min, accesibles_f_max
    from public.butacas
    where sala_id = sala.id and fila = 'F' and tipo::text = 'accesible';

    if total_butacas not in (532, 560)
      or accesibles_e not in (14, 28)
      or accesibles_f not in (14, 28)
      or accesibles_e <> accesibles_e_distintas
      or accesibles_f <> accesibles_f_distintas
      or accesibles_e_min <> 1
      or accesibles_e_max <> accesibles_e
      or accesibles_f_min <> 1
      or accesibles_f_max <> accesibles_f
      or exists (
        select 1
        from public.butacas
        where sala_id = sala.id and fila in ('E', 'F') and tipo::text <> 'accesible'
      )
      or (
        select count(*)
        from public.butacas
        where sala_id = sala.id
          and fila in ('J', 'K')
          and tipo::text = 'normal'
      ) <> 56
      or exists (
        select 1
        from public.butacas
        where sala_id = sala.id
          and fila in ('J', 'K')
          and tipo::text <> 'normal'
      )
    then
      raise exception 'No se puede ampliar las filas accesibles: la sala % no coincide con el diseño esperado (E/F accesibles, J/K normales y 532 o 560 butacas).', sala.id;
    end if;
  end loop;
end;
$validate_layout$;

insert into public.butacas (sala_id, fila, numero, bloque, tipo)
select s.id,
       fila,
       numero,
       case
         when numero <= 4 then 1
         when numero <= 24 then 2
         else 3
       end,
       'accesible'::public.tipo_butaca
from public.salas s
cross join (values ('E'), ('F')) as filas(fila)
cross join generate_series(1, 28) as asientos(numero)
where not exists (
  select 1
  from public.butacas b
  where b.sala_id = s.id
    and b.fila = filas.fila
    and b.numero = asientos.numero
);

update public.butacas
set bloque = case
  when numero <= 4 then 1
  when numero <= 24 then 2
  else 3
end
where fila in ('E', 'F')
  and tipo::text = 'accesible';

create or replace function public.crear_butacas(p_sala_id bigint)
returns void
language sql
as $function$
  with filas as (
    select chr(64 + f) as fila
    from generate_series(1, 20) f
  )
  insert into public.butacas (sala_id, fila, numero, bloque, tipo)
  select p_sala_id,
         fi.fila,
         n,
         case
           when n <= 4 then 1
           when n <= 24 then 2
           else 3
         end,
         (case
           when fi.fila in ('E', 'F') then 'accesible'
           when fi.fila in ('R', 'S', 'T') then 'vip'
           else 'normal'
         end)::public.tipo_butaca
  from filas fi
  cross join lateral generate_series(1, 28) n;
$function$;

commit;
