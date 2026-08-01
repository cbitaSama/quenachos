"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MessageSquare, Search, RefreshCw } from "lucide-react";
import type { ChatResumen, MensajeChat, MotivoSinChat } from "@/lib/waha";

/**
 * La cara de la sección Chat: lista de conversaciones a la izquierda, mensajes
 * a la derecha. En el celular se ve una cosa a la vez (lista → conversación),
 * porque Darko entra casi siempre desde el teléfono.
 */

function cuando(ms: number | null): string {
  if (!ms) return "";
  const d = new Date(ms);
  const hoy = new Date();
  const mismoDia =
    d.getDate() === hoy.getDate() &&
    d.getMonth() === hoy.getMonth() &&
    d.getFullYear() === hoy.getFullYear();
  const hora = d.toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" });
  if (mismoDia) return hora;
  const ayer = new Date(hoy.getTime() - 86400000);
  const esAyer =
    d.getDate() === ayer.getDate() &&
    d.getMonth() === ayer.getMonth() &&
    d.getFullYear() === ayer.getFullYear();
  if (esAyer) return `ayer ${hora}`;
  return d.toLocaleDateString("es-BO", { day: "2-digit", month: "short" }) + ` ${hora}`;
}

export function ChatClient({
  chats,
  activo,
  mensajes,
  motivo = "ok",
}: {
  chats: ChatResumen[];
  activo: ChatResumen | null;
  mensajes: MensajeChat[];
  motivo?: MotivoSinChat;
}) {
  const router = useRouter();
  const [busqueda, setBusqueda] = useState("");
  const [abierto, setAbierto] = useState(false); // móvil: ¿viendo la conversación?

  const filtrados = busqueda.trim()
    ? chats.filter((c) =>
        `${c.nombre} ${c.telefono}`.toLowerCase().includes(busqueda.trim().toLowerCase()),
      )
    : chats;

  if (!chats.length) {
    const TEXTO: Record<MotivoSinChat, { titulo: string; detalle: string }> = {
      ok: {
        titulo: "Todavía no hay conversaciones",
        detalle:
          "Cuando alguien le escriba al WhatsApp del negocio, la charla aparece acá.",
      },
      "sin-almacen": {
        titulo: "Falta activar el historial",
        detalle:
          "Tu WhatsApp está conectado y el bot funciona normal, pero hoy no guarda el historial de las charlas, así que no hay nada que mostrar acá todavía. Activarlo lleva un momento y hay que volver a escanear el código QR una vez — avisanos y lo coordinamos para hacerlo en un horario tranquilo.",
      },
      "sin-configurar": {
        titulo: "Falta conectar el WhatsApp",
        detalle: "El panel todavía no tiene los datos de conexión. Avisanos y lo dejamos listo.",
      },
      error: {
        titulo: "No pudimos leer las conversaciones",
        detalle:
          "Puede ser algo momentáneo. Probá de nuevo en un rato; si sigue igual, avisanos.",
      },
    };
    const t = TEXTO[motivo];
    return (
      <div className="rounded-2xl border border-[var(--color-gris-200)] bg-white p-8 text-center">
        <MessageSquare className="mx-auto h-8 w-8 text-[var(--color-gris-300)]" />
        <p className="mt-3 text-body-md font-medium">{t.titulo}</p>
        <p className="mx-auto mt-2 max-w-md text-body-sm leading-relaxed text-[var(--color-gris-500)]">
          {t.detalle}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      {/* ── Lista de conversaciones ─────────────────────────────────────── */}
      <aside className={`${abierto ? "hidden lg:block" : "block"}`}>
        <div className="overflow-hidden rounded-2xl border border-[var(--color-gris-200)] bg-white">
          <div className="border-b border-[var(--color-gris-200)] p-3">
            <div className="flex items-center gap-2 rounded-lg bg-[var(--color-crema)] px-3 py-2">
              <Search className="h-4 w-4 shrink-0 text-[var(--color-gris-400)]" />
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre o número"
                className="w-full bg-transparent text-body-sm outline-none placeholder:text-[var(--color-gris-400)]"
              />
            </div>
          </div>

          <ul className="max-h-[62vh] divide-y divide-[var(--color-gris-100)] overflow-y-auto">
            {filtrados.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => {
                    setAbierto(true);
                    router.push(`/admin/chat?c=${encodeURIComponent(c.id)}`);
                  }}
                  className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--color-crema)] ${
                    activo?.id === c.id ? "bg-[var(--color-crema)]" : ""
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-body-sm font-semibold">{c.nombre}</p>
                      <span className="shrink-0 text-[11px] text-[var(--color-gris-400)]">
                        {cuando(c.cuando)}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-[13px] text-[var(--color-gris-500)]">
                      {c.ultimoMensaje || "—"}
                    </p>
                  </div>
                  {c.sinLeer > 0 && (
                    <span className="mt-1 shrink-0 rounded-full bg-[var(--color-rojo)] px-1.5 py-0.5 text-[10px] font-bold text-white">
                      {c.sinLeer}
                    </span>
                  )}
                </button>
              </li>
            ))}
            {!filtrados.length && (
              <li className="px-4 py-6 text-center text-body-sm text-[var(--color-gris-500)]">
                Nadie con ese nombre o número.
              </li>
            )}
          </ul>
        </div>
      </aside>

      {/* ── La conversación ─────────────────────────────────────────────── */}
      <section className={`${abierto ? "block" : "hidden lg:block"}`}>
        <div className="flex h-[68vh] flex-col overflow-hidden rounded-2xl border border-[var(--color-gris-200)] bg-white">
          <header className="flex items-center gap-3 border-b border-[var(--color-gris-200)] px-4 py-3">
            <button
              type="button"
              onClick={() => setAbierto(false)}
              className="text-body-sm text-[var(--color-gris-500)] lg:hidden"
            >
              ← Volver
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-body-md font-semibold">{activo?.nombre ?? "—"}</p>
              {activo && (
                <a
                  href={`https://wa.me/${activo.telefono}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[12px] text-[var(--color-gris-500)] underline-offset-2 hover:underline"
                >
                  +{activo.telefono} · abrir en WhatsApp para responder
                </a>
              )}
            </div>
            <button
              type="button"
              onClick={() => router.refresh()}
              title="Actualizar"
              className="rounded-lg p-2 text-[var(--color-gris-400)] transition-colors hover:bg-[var(--color-crema)] hover:text-[var(--color-gris-600)]"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </header>

          <div className="flex-1 space-y-2 overflow-y-auto bg-[var(--color-crema)] p-4">
            {mensajes.map((m) => (
              <div key={m.id} className={`flex ${m.mio ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-body-sm ${
                    m.mio
                      ? "rounded-br-sm bg-[var(--color-verde,#128C7E)] text-white"
                      : "rounded-bl-sm bg-white text-[var(--color-gris-700,#1f2937)]"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{m.texto}</p>
                  <p
                    className={`mt-1 text-right text-[10px] ${
                      m.mio ? "text-white/70" : "text-[var(--color-gris-400)]"
                    }`}
                  >
                    {cuando(m.cuando)}
                  </p>
                </div>
              </div>
            ))}
            {!mensajes.length && (
              <p className="py-10 text-center text-body-sm text-[var(--color-gris-500)]">
                Sin mensajes para mostrar.
              </p>
            )}
          </div>

          <footer className="border-t border-[var(--color-gris-200)] bg-white px-4 py-3">
            <p className="text-[12px] leading-snug text-[var(--color-gris-500)]">
              Esta pantalla es <strong>para leer</strong>. Para responderle a un
              cliente, escribile desde WhatsApp en tu celular: así el bot se calla
              solo en esa conversación y no le contesta encima.
            </p>
          </footer>
        </div>
      </section>
    </div>
  );
}
