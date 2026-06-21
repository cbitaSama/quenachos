// Control del bot (workflow Nachito en n8n) desde el panel.
// Solo corre en el servidor. La API key nunca llega al navegador. Best-effort.
const N8N_URL = (process.env.N8N_API_URL || "").trim().replace(/\/$/, "");
const N8N_KEY = (process.env.N8N_API_KEY || "").trim();
const WF = (process.env.N8N_BOT_WORKFLOW_ID || "").trim();

// true/false si el workflow está activo en n8n; null si no se pudo determinar.
export async function getBotActivo(): Promise<boolean | null> {
  if (!N8N_URL || !N8N_KEY || !WF) return null;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 6000);
    const r = await fetch(`${N8N_URL}/workflows/${WF}`, {
      headers: { "X-N8N-API-KEY": N8N_KEY, accept: "application/json" },
      cache: "no-store",
      signal: ctrl.signal,
    });
    clearTimeout(t);
    if (!r.ok) return null;
    const d = await r.json();
    return Boolean(d?.active);
  } catch {
    return null;
  }
}

export async function setBotActivo(
  active: boolean,
): Promise<{ ok: boolean; error?: string }> {
  if (!N8N_URL || !N8N_KEY || !WF) return { ok: false, error: "n8n no configurado" };
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const r = await fetch(
      `${N8N_URL}/workflows/${WF}/${active ? "activate" : "deactivate"}`,
      {
        method: "POST",
        headers: { "X-N8N-API-KEY": N8N_KEY, accept: "application/json" },
        cache: "no-store",
        signal: ctrl.signal,
      },
    );
    clearTimeout(t);
    if (!r.ok) return { ok: false, error: `n8n respondió ${r.status}` };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error de red" };
  }
}
