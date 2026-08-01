-- ============================================================================
-- Historial de conversaciones de Que Nachos (2026-08-01)
--
-- POR QUÉ NO SE LEE DE WAHA: la sesión `Nachito` corre con motor NOWEB SIN el
-- "store" activado, así que WAHA no guarda ni devuelve chats. Y la doc oficial
-- es explícita: **no se cambia esa opción después de escanear el QR** (se puede
-- perder el historial) y no hay endpoint para actualizarla — habría que crear
-- una sesión nueva, o sea escanear el QR otra vez. Sobre el bot VIVO de un
-- cliente que paga, eso no se hace.
--
-- LA SALIDA: guardamos nosotros cada mensaje cuando pasa. Sale mejor que WAHA:
-- el historial queda en la base del cliente, es permanente, se puede buscar, y
-- sobrevive a cualquier cambio de sesión de WhatsApp.
--
-- Es 100% ADITIVO: tabla nueva + funciones nuevas. No toca ni una línea de lo
-- que ya existe, así que aplicarlo no puede romper el bot.
-- ============================================================================

create table if not exists quenachos.mensajes (
  id          bigserial primary key,
  telefono    text not null,
  -- true = lo mandó el negocio (bot o el dueño desde el celular).
  mio         boolean not null default false,
  texto       text,
  tipo        text not null default 'chat',
  -- id del mensaje en WhatsApp: evita duplicados si el webhook llega dos veces.
  msg_id      text unique,
  created_at  timestamptz not null default now()
);

create index if not exists idx_qn_mensajes_tel
  on quenachos.mensajes (telefono, created_at desc);

alter table quenachos.mensajes enable row level security;
-- Sin policies a propósito: igual que el resto del esquema, solo entra por
-- service_role y por las funciones SECURITY DEFINER de abajo.

-- ── Guardar un mensaje (lo llama el webhook) ────────────────────────────────
create or replace function public.qn_log_mensaje(
  p_telefono text,
  p_mio boolean,
  p_texto text,
  p_tipo text default 'chat',
  p_msg_id text default null
) returns void
language plpgsql security definer set search_path to ''
as $$
declare v_tel text := nullif(regexp_replace(coalesce(p_telefono,''), '\D', '', 'g'), '');
begin
  if v_tel is null then return; end if;
  insert into quenachos.mensajes (telefono, mio, texto, tipo, msg_id)
  values (v_tel, coalesce(p_mio,false), p_texto, coalesce(nullif(p_tipo,''),'chat'), p_msg_id)
  on conflict (msg_id) do nothing;
end; $$;

-- ── Leer: la lista de conversaciones ────────────────────────────────────────
create or replace function public.qn_chats(p_limite int default 50)
returns jsonb
language sql security definer set search_path to ''
as $$
  select coalesce(jsonb_agg(x order by x->>'cuando' desc), '[]'::jsonb) from (
    select jsonb_build_object(
      'telefono', m.telefono,
      'nombre',   coalesce(nullif(c.nombre,''), '+' || m.telefono),
      'ultimo',   m.texto,
      'mio',      m.mio,
      'cuando',   m.created_at
    ) x
    from (
      select distinct on (telefono) telefono, texto, mio, created_at
        from quenachos.mensajes order by telefono, created_at desc
    ) m
    left join quenachos.clientes c on c.telefono = m.telefono
    order by m.created_at desc
    limit greatest(1, least(coalesce(p_limite,50), 200))
  ) t;
$$;

-- ── Leer: los mensajes de una conversación ──────────────────────────────────
create or replace function public.qn_mensajes(p_telefono text, p_limite int default 100)
returns jsonb
language sql security definer set search_path to ''
as $$
  select coalesce(jsonb_agg(x order by x->>'cuando'), '[]'::jsonb) from (
    select jsonb_build_object(
      'id', id, 'mio', mio, 'texto', texto, 'tipo', tipo, 'cuando', created_at
    ) x, created_at
    from quenachos.mensajes
    where telefono = nullif(regexp_replace(coalesce(p_telefono,''), '\D', '', 'g'), '')
    order by created_at desc
    limit greatest(1, least(coalesce(p_limite,100), 500))
  ) t;
$$;

revoke execute on function public.qn_log_mensaje(text,boolean,text,text,text) from public, anon, authenticated;
revoke execute on function public.qn_chats(int) from public, anon, authenticated;
revoke execute on function public.qn_mensajes(text,int) from public, anon, authenticated;
grant execute on function public.qn_log_mensaje(text,boolean,text,text,text) to service_role;
grant execute on function public.qn_chats(int) to service_role;
grant execute on function public.qn_mensajes(text,int) to service_role;
