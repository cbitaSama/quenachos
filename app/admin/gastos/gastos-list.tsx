"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { eliminarGasto } from "@/lib/admin/actions";
import { formatBs, formatDia } from "@/lib/admin/format";
import { EmptyState } from "@/components/admin/ui";
import type { GastoRow } from "@/lib/admin/types";

export function GastosList({ gastos }: { gastos: GastoRow[] }) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const borrar = (g: GastoRow) => {
    if (!confirm(`¿Eliminar el gasto de ${formatBs(g.montoBs)} (${g.categoria})?`)) return;
    start(async () => {
      setErr(null);
      const r = await eliminarGasto(g.id);
      if (!r.ok) setErr(r.error);
    });
  };

  if (gastos.length === 0) {
    return <EmptyState>No hay gastos en este período.</EmptyState>;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-negro)]/10 bg-white">
      {err && <p className="px-4 py-2 text-body-sm text-[var(--color-rojo)]">{err}</p>}
      <table className="w-full text-left text-body-sm">
        <thead className="border-b border-[var(--color-negro)]/10 text-caption text-[var(--color-gris-500)]">
          <tr>
            <th className="px-4 py-2.5 font-normal">Fecha</th>
            <th className="px-4 py-2.5 font-normal">Categoría</th>
            <th className="px-4 py-2.5 font-normal">Detalle</th>
            <th className="px-4 py-2.5 text-right font-normal">Monto</th>
            <th className="px-4 py-2.5" />
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-negro)]/5">
          {gastos.map((g) => (
            <tr key={g.id}>
              <td className="whitespace-nowrap px-4 py-2.5 text-[var(--color-gris-500)]">
                {formatDia(g.fecha)}
              </td>
              <td className="px-4 py-2.5 font-medium">{g.categoria}</td>
              <td className="px-4 py-2.5 text-[var(--color-gris-500)]">
                {g.empleado ?? g.descripcion ?? "—"}
                {g.nota ? ` · ${g.nota}` : ""}
              </td>
              <td className="px-4 py-2.5 text-right font-semibold tabular-nums">
                {formatBs(g.montoBs)}
              </td>
              <td className="px-4 py-2.5 text-right">
                <button
                  type="button"
                  onClick={() => borrar(g)}
                  disabled={pending}
                  aria-label="Eliminar gasto"
                  className="inline-flex size-8 items-center justify-center rounded-lg text-[var(--color-gris-500)] transition-colors hover:bg-[var(--color-rojo)]/10 hover:text-[var(--color-rojo)] disabled:opacity-40"
                >
                  <Trash2 className="size-4" strokeWidth={2} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
