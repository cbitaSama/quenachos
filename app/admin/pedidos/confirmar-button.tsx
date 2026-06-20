"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { confirmarPedido } from "@/lib/admin/actions";

export function ConfirmarButton({ pedidoId }: { pedidoId: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            setError(null);
            const r = await confirmarPedido(pedidoId);
            if (!r.ok) setError(r.error);
          })
        }
        className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-rojo)] px-4 py-2 text-body-sm font-bold text-[var(--color-crema)] transition-all hover:bg-[var(--color-rojo-oscuro)] disabled:opacity-60"
      >
        <Check className="size-4" strokeWidth={2.75} />
        {pending ? "Confirmando…" : "Confirmar pago"}
      </button>
      {error && (
        <span className="max-w-[200px] text-right text-[11px] text-[var(--color-rojo)]">
          {error}
        </span>
      )}
    </div>
  );
}
