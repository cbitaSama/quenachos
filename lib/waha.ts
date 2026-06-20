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
