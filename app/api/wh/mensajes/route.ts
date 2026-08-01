import { createAdminClient } from "@/lib/supabase/server";

/**
 * Recibe los mensajes de WhatsApp y los guarda, para que el panel tenga
 * historial propio.
 *
 * POR QUÉ EXISTE: la sesión de Nachito corre sin el "store" de WAHA, así que
 * WAHA no guarda las charlas — y activarlo obliga a crear una sesión nueva
 * (QR nuevo) sobre el bot vivo de un cliente que paga. En vez de eso guardamos
 * nosotros cada mensaje cuando pasa: el historial queda en la base del cliente,
 * es permanente y sobrevive a cualquier cambio de sesión de WhatsApp.
 *
 * Se engancha como un webhook MÁS de la sesión (los eventos `message` y
 * `message.any`), sin tocar el workflow del bot. Es un oyente: no responde
 * nada, no manda nada, y si falla no afecta al bot — WAHA solo vería un error
 * en un webhook secundario.
 *
 * Seguridad: es público como todo webhook, así que exige un secreto compartido
 * (`WA_LOG_SECRET`) en la URL o en la cabecera. Sin secreto configurado, el
 * endpoint queda cerrado.
 */

export const dynamic = "force-dynamic";

const SECRETO = (process.env.WA_LOG_SECRET || "").trim();
/** Solo esta sesión. Los mensajes de otro negocio no entran acá. */
const SESION = (process.env.WAHA_SESSION || "Nachito").trim();

function autorizado(req: Request): boolean {
  if (!SECRETO) return false; // sin secreto configurado → cerrado
  const url = new URL(req.url);
  if (url.searchParams.get("s") === SECRETO) return true;
  return req.headers.get("x-log-secret") === SECRETO;
}

/** El teléfono real del cliente, resistente a los chats `@lid` de WhatsApp. */
function telefonoDe(payload: Record<string, unknown>, mio: boolean): string {
  const key = (payload.key ?? {}) as Record<string, unknown>;
  const candidatos = [
    key.remoteJidAlt,
    key.senderPn,
    payload.senderPn,
    payload.remoteJidAlt,
    mio ? payload.to : payload.from,
  ];
  for (const c of candidatos) {
    if (typeof c !== "string") continue;
    // Solo JIDs de persona: nada de grupos, canales ni difusión.
    if (!/@(s\.whatsapp\.net|c\.us)$/.test(c)) continue;
    const d = c.split("@")[0]?.replace(/\D/g, "") ?? "";
    if (d) return d;
  }
  return "";
}

function textoDe(p: Record<string, unknown>): { texto: string; tipo: string } {
  const tipo = String(p.type ?? "chat");
  const body = typeof p.body === "string" ? p.body.trim() : "";
  if (body) return { texto: body, tipo };
  if (p.hasMedia || tipo === "image") return { texto: "📷 Foto", tipo };
  if (tipo === "ptt" || tipo === "audio") return { texto: "🎙️ Audio", tipo };
  if (tipo === "document") return { texto: "📄 Documento", tipo };
  if (tipo === "location") return { texto: "📍 Ubicación", tipo };
  return { texto: "", tipo };
}

export async function POST(req: Request) {
  if (!autorizado(req)) {
    return Response.json({ ok: false }, { status: 401 });
  }
  try {
    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) return Response.json({ ok: true });

    // Solo la sesión de este negocio.
    if (typeof body.session === "string" && body.session !== SESION) {
      return Response.json({ ok: true, ignorado: "otra sesión" });
    }
    const evento = String(body.event ?? "");
    if (evento !== "message" && evento !== "message.any") {
      return Response.json({ ok: true, ignorado: evento });
    }

    const payload = (body.payload ?? {}) as Record<string, unknown>;
    const mio = Boolean(payload.fromMe);
    const telefono = telefonoDe(payload, mio);
    if (!telefono) return Response.json({ ok: true, ignorado: "sin teléfono" });

    const { texto, tipo } = textoDe(payload);
    if (!texto) return Response.json({ ok: true, ignorado: "vacío" });

    await createAdminClient().rpc("qn_log_mensaje", {
      p_telefono: telefono,
      p_mio: mio,
      p_texto: texto.slice(0, 4000),
      p_tipo: tipo,
      p_msg_id: typeof payload.id === "string" ? payload.id : null,
    });

    return Response.json({ ok: true });
  } catch {
    // Nunca devolvemos error: un webhook que falla puede hacer que WAHA
    // reintente o marque la sesión con problemas. Preferimos perder un
    // mensaje del historial antes que molestar al bot.
    return Response.json({ ok: true });
  }
}
