"use client";

import { useRef, useState, useTransition } from "react";
import { ChevronDown, MessageCircleQuestion, Send } from "lucide-react";
import { preguntarAyuda } from "@/lib/admin/actions";
import { Card, inputClass } from "@/components/admin/ui";
import type { SeccionManual } from "@/lib/admin/manual";

// Preguntas típicas para que Darko arranque con un tap.
const SUGERENCIAS = [
  "¿Cómo confirmo un pago?",
  "¿Cómo hago que el bot no le responda a alguien?",
  "¿Cómo doy de alta a un proveedor a crédito?",
  "¿Cómo cambio un precio?",
  "¿Qué pasa si yo respondo a mano un chat?",
];

type Msg = { rol: "user" | "model"; texto: string };

export function AyudaClient({ secciones }: { secciones: SeccionManual[] }) {
  return (
    <div className="space-y-7">
      <ChatAyuda />

      <section className="space-y-3">
        <h2 className="text-caption text-[var(--color-gris-500)]">
          La guía completa, sección por sección
        </h2>
        <div className="space-y-2">
          {secciones.map((s) => (
            <Seccion key={s.id} seccion={s} />
          ))}
        </div>
      </section>
    </div>
  );
}

function Seccion({ seccion }: { seccion: SeccionManual }) {
  const [abierta, setAbierta] = useState(false);
  return (
    <div className="rounded-2xl border border-[var(--color-negro)]/10 bg-white">
      <button
        type="button"
        onClick={() => setAbierta((a) => !a)}
        className="flex w-full items-center justify-between gap-3 p-4 text-left sm:p-5"
      >
        <span className="min-w-0">
          <span className="block text-body-md font-semibold">
            {seccion.emoji} {seccion.titulo}
          </span>
          <span className="block text-body-sm text-[var(--color-gris-500)]">
            {seccion.resumen}
          </span>
        </span>
        <ChevronDown
          className={`size-5 shrink-0 text-[var(--color-gris-500)] transition-transform ${
            abierta ? "rotate-180" : ""
          }`}
          strokeWidth={2.25}
        />
      </button>
      {abierta && (
        <div className="border-t border-[var(--color-negro)]/[0.06] px-4 pb-4 pt-3 sm:px-5 sm:pb-5">
          <p className="whitespace-pre-line text-body-sm leading-relaxed text-[var(--color-negro)]">
            {seccion.contenido}
          </p>
        </div>
      )}
    </div>
  );
}

function ChatAyuda() {
  const [mensajes, setMensajes] = useState<Msg[]>([]);
  const [texto, setTexto] = useState("");
  const [pending, start] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);

  const preguntar = (pregunta: string) => {
    const p = pregunta.trim();
    if (!p || pending) return;
    const historial = mensajes;
    setMensajes((m) => [...m, { rol: "user", texto: p }]);
    setTexto("");
    start(async () => {
      const r = await preguntarAyuda({ pregunta: p, historial });
      setMensajes((m) => [
        ...m,
        { rol: "model", texto: r.ok ? r.respuesta : r.error },
      ]);
      requestAnimationFrame(() =>
        scrollRef.current?.scrollTo({ top: 99999, behavior: "smooth" }),
      );
    });
  };

  return (
    <Card title="💬 Preguntale a Nachito — tu guía del panel">
      <p className="mb-3 text-body-sm text-[var(--color-gris-500)]">
        Escribí tu duda como si le preguntaras a una persona: “¿cómo cobro una
        cuenta?”, “¿dónde veo el stock?”. Te responde al toque.
      </p>

      {mensajes.length === 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {SUGERENCIAS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => preguntar(s)}
              disabled={pending}
              className="rounded-full border border-[var(--color-negro)]/15 px-3 py-1.5 text-body-sm hover:bg-[var(--color-negro)]/[0.04] disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {mensajes.length > 0 && (
        <div
          ref={scrollRef}
          className="mb-3 max-h-80 space-y-2 overflow-y-auto rounded-xl bg-[var(--color-negro)]/[0.03] p-3"
        >
          {mensajes.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.rol === "user" ? "justify-end" : "justify-start"}`}
            >
              <p
                className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2 text-body-sm leading-relaxed ${
                  m.rol === "user"
                    ? "bg-[var(--color-rojo)] text-[var(--color-crema)]"
                    : "bg-white text-[var(--color-negro)] shadow-sm"
                }`}
              >
                {m.texto}
              </p>
            </div>
          ))}
          {pending && (
            <div className="flex justify-start">
              <p className="rounded-2xl bg-white px-3.5 py-2 text-body-sm text-[var(--color-gris-500)] shadow-sm">
                Nachito está escribiendo…
              </p>
            </div>
          )}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          preguntar(texto);
        }}
        className="flex gap-2"
      >
        <input
          className={`${inputClass} flex-1`}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Tu pregunta… (ej: ¿cómo silencio a mi abogado?)"
          disabled={pending}
        />
        <button
          type="submit"
          disabled={pending || !texto.trim()}
          aria-label="Preguntar"
          className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-rojo)] px-4 py-2.5 text-body-sm font-bold text-[var(--color-crema)] disabled:opacity-50"
        >
          {pending ? (
            "…"
          ) : (
            <>
              <Send className="size-4" strokeWidth={2.5} /> Preguntar
            </>
          )}
        </button>
      </form>

      <p className="mt-2 flex items-center gap-1.5 text-[11px] text-[var(--color-gris-500)]">
        <MessageCircleQuestion className="size-3.5" />
        Nachito solo sabe de TU panel y TU bot. Si algo se rompió o querés un
        cambio nuevo, escribile a Sebas.
      </p>
    </Card>
  );
}
