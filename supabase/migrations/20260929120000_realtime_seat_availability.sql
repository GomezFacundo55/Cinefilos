create or replace function public.butacas_ocupadas(p_funcion_id bigint)
returns table (butaca_id bigint)
language plpgsql
stable
security definer
set search_path = public
as $function$
begin
  if not exists (
    select 1
    from public.funciones f
    where f.id = p_funcion_id
      and f.estado = 'programada'
      and f.inicio > now()
  ) then
    raise exception 'La función no está disponible';
  end if;

  return query
  select e.butaca_id
  from public.entradas e
  where e.funcion_id = p_funcion_id
    and e.estado <> 'cancelada'::public.estado_entrada;
end;
$function$;

revoke all on function public.butacas_ocupadas(bigint) from public;
grant execute on function public.butacas_ocupadas(bigint) to anon, authenticated;

create or replace function public.publicar_cambio_disponibilidad_butaca()
returns trigger
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_funcion_id bigint;
  v_butaca_id bigint;
  v_ocupada boolean;
begin
  if tg_op = 'DELETE' then
    v_funcion_id := old.funcion_id;
    v_butaca_id := old.butaca_id;
    v_ocupada := false;
  else
    v_funcion_id := new.funcion_id;
    v_butaca_id := new.butaca_id;
    v_ocupada := new.estado <> 'cancelada'::public.estado_entrada;
  end if;

  perform realtime.send(
    jsonb_build_object(
      'butaca_id', v_butaca_id,
      'ocupada', v_ocupada
    ),
    'butaca_actualizada',
    'funcion:' || v_funcion_id::text,
    false
  );

  return null;
end;
$function$;

revoke all on function public.publicar_cambio_disponibilidad_butaca() from public, anon, authenticated;

drop trigger if exists entradas_publicar_disponibilidad on public.entradas;
create trigger entradas_publicar_disponibilidad
after insert or update of estado or delete on public.entradas
for each row
execute function public.publicar_cambio_disponibilidad_butaca();
