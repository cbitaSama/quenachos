"use client";

import { useState, useTransition } from "react";
import { Power, PauseCircle } from "lucide-react";
import { pausarNumero, toggleBotGlobal } from "@/lib/admin/actions";
import { Card, inputClass } from "@/components/admin/ui";

type Msg = { ok: boolean; text: string } | null;

function MsgLine({ msg }: { msg: Msg }) {
  if (!msg) return null;
  return (
    <p className={`mt-2 text-body-sm ${msg.ok ? "text-[#16a34a]" : "text-[var(--color-rojo)]"}`}>
      {msg.text}
    </p>
  );
}

export function BotControl({ activo }: { activo: boolean | null }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <GlobalToggle activo={activo} />
      <PausarCliente />
    </div>
  );
}

function GlobalToggle({ activo }: { activo: boolean | null }) {
  const [estado, setEstado] = useState<boolean | null>(activo);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<Msg>(null);

  if (estado === null) {
    return (
      <Card title="Estado del bot">
        <p className="text-body-sm text-[var(--color-gris-500)]">
          No se pudo leer el estado del bot (revisá la config de n8n).
        </p>
      </Card>
    );
  }

  const apagar = estado; // si está encendido, el botón apaga

  return (
    <Card title="Estado del bot">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className={`inline-block size-2.5 rounded-full ${
              estado ? "bg-[#16a34a]" : "bg-[var(--color-rojo)]"
            }`}
          />
          <span className="text-body-md font-semibold">
            {estado ? "Encendido" : "Apagado"}
          </span>
          <span className="text-body-sm text-[var(--color-gris-500)]">
            {estado ? "responde a todos" : "no responde a nadie"}
          </span>
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              setMsg(null);
              const r = await toggleBotGlobal(!estado);
              if (r.ok) setEstado(!estado);
              setMsg(r.ok ? { ok: true, text: r.message ?? "Listo" } : { ok: false, text: r.error });
            })
          }
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-body-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50 ${
            apagar ? "bg-[var(--color-rojo)]" : "bg-[#16a34a]"
          }`}
        >
          <Power className="size-4" strokeWidth={2.5} />
          {pending ? "…" : apagar ? "Apagar el bot" : "Encender el bot"}
        </button>
      </div>
      <MsgLine msg={msg} />
      <p className="mt-3 text-[11px] leading-relaxed text-[var(--color-gris-500)]">
        Apagado, el bot no le responde a nadie. Los mensajes que lleguen mientras
        está apagado se responden al encenderlo <strong>si fue un rato corto</strong>;
        si pasaron muchas horas o días, esos mensajes ya no se contestan solos.
      </p>
    </Card>
  );
}

function PausarCliente() {
  const [tel, setTel] = useState("");
  const [nombre, setNombre] = useState("");
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<Msg>(null);

  return (
    <Card title="Pausar el bot para un cliente">
      <p className="mb-2 text-body-sm text-[var(--color-gris-500)]">
        Para hablarle vos directo. El bot deja de responderle hasta que toques
        “Solucionado, activar bot”.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            setMsg(null);
            const r = await pausarNumero({ telefono: tel, nombre });
            setMsg(r.ok ? { ok: true, text: r.message ?? "Pausado" } : { ok: false, text: r.error });
            if (r.ok) {
              setTel("");
              setNombre("");
            }
          });
        }}
        className="flex flex-col gap-2"
      >
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            className={`${inputClass} sm:flex-1`}
            value={tel}
            onChange={(e) => setTel(e.target.value)}
            placeholder="Número (591...)"
          />
          <input
            className={`${inputClass} sm:flex-1`}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre (opcional)"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-[var(--color-negro)] px-4 py-2.5 text-body-sm font-bold text-[var(--color-crema)] disabled:opacity-60 sm:w-auto sm:self-start"
        >
          <PauseCircle className="size-4" strokeWidth={2.25} />
          {pending ? "…" : "Pausar"}
        </button>
      </form>
      <MsgLine msg={msg} />
    </Card>
  );
}
