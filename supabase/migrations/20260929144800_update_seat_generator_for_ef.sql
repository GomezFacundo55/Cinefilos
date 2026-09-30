create or replace function public.crear_butacas(p_sala_id bigint)
returns void
language sql
as $function$
  with filas as (
    select chr(64 + f) as fila,
           case when chr(64 + f) in ('E', 'F') then 0 else 4 end as lado,
           case when chr(64 + f) in ('E', 'F') then 14 else 20 end as centro
    from generate_series(1, 20) f
  )
  insert into public.butacas (sala_id, fila, numero, bloque, tipo)
  select p_sala_id,
         fi.fila,
         n,
         case
           when fi.fila in ('E', 'F') then 2
           when n <= fi.lado then 1
           when n <= fi.lado + fi.centro then 2
           else 3
         end,
         (case
           when fi.fila in ('E', 'F') then 'accesible'
           when fi.fila in ('R', 'S', 'T') then 'vip'
           else 'normal'
         end)::public.tipo_butaca
  from filas fi
  cross join lateral generate_series(1, fi.lado * 2 + fi.centro) n;
$function$;
