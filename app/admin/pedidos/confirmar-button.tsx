"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { confirmarPedido } from "@/lib/admin/actions";

export function ConfirmarButton({
  pedidoId,
  label = "Confirmar pago",
}: {
  pedidoId: string;
  label?: string;
}) {
  const [, start] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={done}
        onClick={() =>
          // Reacción instantánea: marcamos "listo" de una y el guardado (+ aviso
          // por WhatsApp) sigue por detrás. Si falla, revertimos y mostramos error.
          start(async () => {
            setError(null);
            setDone(true);
            const r = await confirmarPedido(pedidoId);
            if (!r.ok) {
              setDone(false);
              setError(r.error);
            }
          })
        }
        className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-rojo)] px-4 py-2 text-body-sm font-bold text-[var(--color-crema)] transition-all hover:bg-[var(--color-rojo-oscuro)] active:scale-95 disabled:opacity-60"
      >
        <Check className="size-4" strokeWidth={2.75} />
        {done ? "Listo ✓" : label}
      </button>
      {error && (
        <span className="max-w-[200px] text-right text-[11px] text-[var(--color-rojo)]">
          {error}
        </span>
      )}
    </div>
  );
}
