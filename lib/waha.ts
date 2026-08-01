// Envío de WhatsApp vía WAHA (mismo número/sesión del bot Nachito).
// Best-effort: si falla o falta config, no rompe la acción del panel.
const WAHA_URL = (process.env.WAHA_URL || "").trim().replace(/\/$/, "");
const WAHA_API_KEY = (process.env.WAHA_API_KEY || "").trim();
const WAHA_SESSION = (process.env.WAHA_SESSION || "Nachito").trim();

export async function enviarWhatsApp(
  chatId: string | null | undefined,
  text: string,
): Promise<boolean> {
  if (!WAHA_URL || !WAHA_API_KEY || !chatId) return false;
  try {
    const res = await fetch(`${WAHA_URL}/api/sendText`, {
      method: "POST",
      headers: { "X-Api-Key": WAHA_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ session: WAHA_SESSION, chatId, text }),
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Envía una imagen (ej. el QR de pago) por su URL pública. Best-effort.
export async function enviarWhatsAppImagen(
  chatId: string | null | undefined,
  fileUrl: string,
  caption?: string,
): Promise<boolean> {
  if (!WAHA_URL || !WAHA_API_KEY || !chatId) return false;
  try {
    const res = await fetch(`${WAHA_URL}/api/sendImage`, {
      method: "POST",
      headers: { "X-Api-Key": WAHA_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        session: WAHA_SESSION,
        chatId,
        file: { url: fileUrl },
        caption: caption ?? "",
      }),
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Convierte un teléfono (solo dígitos) en un chatId de WhatsApp.
export function aChatId(telefono: string | null | undefined): string | null {
  const tel = (telefono ?? "").replace(/\D/g, "");
  return tel ? `${tel}@c.us` : null;
}

// URLs públicas de los QR de pago (bucket qn-assets es público).
// - QR_PAGO_URL: normal / con factura (pedidos normales y proveedor con factura).
// - QR_PAGO_SIN_FACTURA_URL: solo para proveedor SIN factura (cuenta a otro destino).
const QR_BASE = `${(process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "")}/storage/v1/object/public/qn-assets`;
export const QR_PAGO_URL = `${QR_BASE}/qr-pago.jpeg`;
export const QR_PAGO_SIN_FACTURA_URL = `${QR_BASE}/qr-pago-sin-factura.jpeg`;

// ───────────────────────────────────────────────────────────────────────────
// LECTURA de conversaciones — alimenta la sección "Chat" del panel.
//
// ⚠️ TRES CANDADOS, a propósito:
//  1. La sesión NUNCA viene del navegador: sale de `WAHA_SESSION` (Nachito).
//     Aunque alguien manipule la URL, no puede leer la de otro negocio — en la
//     misma WAHA conviven sesiones de otros clientes.
//  2. Es SOLO LECTURA. Acá no hay envío: responderle a un cliente se hace
//     desde WhatsApp en el celular, y eso además pausa el bot 3h solo.
//  3. La API key se queda en el servidor. El navegador nunca la ve.
// ───────────────────────────────────────────────────────────────────────────

export type ChatResumen = {
  id: string;
  nombre: string;
  telefono: string;
  ultimoMensaje: string;
  cuando: number | null;
  sinLeer: number;
};

export type MensajeChat = {
  id: string;
  mio: boolean;
  texto: string;
  cuando: number | null;
  tipo: string;
};

const wahaOk = () => Boolean(WAHA_URL && WAHA_API_KEY);

/** Por qué no hay conversaciones, para poder decirlo en pantalla. */
export type MotivoSinChat = "ok" | "sin-configurar" | "sin-almacen" | "error";

let ultimoMotivo: MotivoSinChat = "ok";
export const motivoSinChat = () => ultimoMotivo;

async function wahaGet<T>(path: string): Promise<T | null> {
  if (!wahaOk()) {
    ultimoMotivo = "sin-configurar";
    return null;
  }
  try {
    const res = await fetch(`${WAHA_URL}${path}`, {
      headers: { "X-Api-Key": WAHA_API_KEY },
      cache: "no-store",
    });
    if (!res.ok) {
      // WAHA con motor NOWEB responde 400 pidiendo el "store" cuando la sesión
      // se creó sin él. Es EXACTAMENTE el caso de Nachito: se puede activar,
      // pero obliga a reiniciar la sesión (y a re-escanear el QR), así que es
      // una decisión del dueño, no algo que el panel deba hacer solo.
      const cuerpo = await res.text().catch(() => "");
      ultimoMotivo = /noweb.*store|store.*enabled/i.test(cuerpo) ? "sin-almacen" : "error";
      return null;
    }
    ultimoMotivo = "ok";
    return (await res.json()) as T;
  } catch {
    ultimoMotivo = "error";
    return null;
  }
}

/** Un texto legible salga el mensaje como salga (texto, foto, audio, ubicación…). */
function textoDe(m: Record<string, unknown>): string {
  const body = typeof m.body === "string" ? m.body.trim() : "";
  const tipo = String(m.type ?? "");
  if (body) return body;
  if (m.hasMedia || tipo === "image") return "📷 Foto";
  if (tipo === "ptt" || tipo === "audio") return "🎙️ Audio";
  if (tipo === "document") return "📄 Documento";
  if (tipo === "location") return "📍 Ubicación";
  if (tipo === "sticker") return "🌟 Sticker";
  return "—";
}

/** Milisegundos: WAHA manda `timestamp` en segundos. */
function cuandoDe(m: Record<string, unknown>): number | null {
  const t = m.timestamp;
  if (typeof t !== "number") return null;
  return t > 1e12 ? t : t * 1000;
}

/** Las conversaciones del número del negocio, de la más reciente a la más vieja. */
export async function getChats(limite = 40): Promise<ChatResumen[]> {
  const data = await wahaGet<Record<string, unknown>[]>(
    `/api/${encodeURIComponent(WAHA_SESSION)}/chats?limit=${limite}&sortBy=conversationTimestamp&sortOrder=desc`,
  );
  if (!Array.isArray(data)) return [];
  return data
    .map((c) => {
      const id = String(c.id ?? "");
      const ultimo = (c.lastMessage ?? {}) as Record<string, unknown>;
      const tel = id.split("@")[0] ?? "";
      return {
        id,
        nombre: String(c.name ?? "").trim() || `+${tel}`,
        telefono: tel,
        ultimoMensaje: Object.keys(ultimo).length ? textoDe(ultimo) : "",
        cuando: Object.keys(ultimo).length ? cuandoDe(ultimo) : null,
        sinLeer: typeof c.unreadCount === "number" ? c.unreadCount : 0,
      };
    })
    // Grupos, canales y difusión no son clientes: fuera.
    .filter((c) => c.id.endsWith("@c.us") || c.id.endsWith("@s.whatsapp.net"));
}

/** Los mensajes de UNA conversación, del más viejo al más nuevo (como se lee). */
export async function getMensajes(chatId: string, limite = 60): Promise<MensajeChat[]> {
  const data = await wahaGet<Record<string, unknown>[]>(
    `/api/${encodeURIComponent(WAHA_SESSION)}/chats/${encodeURIComponent(chatId)}/messages?limit=${limite}&downloadMedia=false`,
  );
  if (!Array.isArray(data)) return [];
  return data
    .map((m) => ({
      id: String(m.id ?? Math.random()),
      mio: Boolean(m.fromMe),
      texto: textoDe(m),
      cuando: cuandoDe(m),
      tipo: String(m.type ?? "chat"),
    }))
    .sort((a, b) => (a.cuando ?? 0) - (b.cuando ?? 0));
}
