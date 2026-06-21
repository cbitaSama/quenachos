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

// URL pública del QR de pago (bucket qn-assets es público).
export const QR_PAGO_URL = `${(process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "")}/storage/v1/object/public/qn-assets/qr-pago.jpeg`;
