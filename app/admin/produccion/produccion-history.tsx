"use client";

import { useState, useTransition } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { editarProduccion, eliminarProduccion } from "@/lib/admin/actions";
import { formatFecha, formatFechaHora } from "@/lib/admin/format";
import { EmptyState } from "@/components/admin/ui";
import type { MovimientoAdmin } from "@/lib/admin/types";

const cellInput =
  "w-full rounded-lg border border-[var(--color-negro)]/15 bg-white px-2 py-1.5 text-body-sm outline-none focus:border-[var(--color-rojo)]";

function isoDate(d: string | null): string {
  if (!d) return "";
  return typeof d === "string" ? d.slice(0, 10) : "";
}

export function ProduccionHistory({ movimientos }: { movimientos: MovimientoAdmin[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [cantidad, setCantidad] = useState("");
  const [lote, setLote] = useState("");
  const [venc, setVenc] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [, start] = useTransition();

  if (movimientos.length === 0) {
    return <EmptyState>Todavía no registraste producción.</EmptyState>;
  }

  const beginEdit = (m: MovimientoAdmin) => {
    setEditing(m.id);
    setCantidad(String(m.cantidad));
    setLote(m.lote ?? "");
    setVenc(isoDate(m.vencimiento));
    setError(null);
    setFlash(null);
  };

  const save = (id: string) => {
    setBusyId(id);
    start(async () => {
      setError(null);
      setFlash(null);
      const r = await editarProduccion({
        movId: id,
        cantidad: Number(cantidad),
        lote: lote || null,
        vencimiento: venc || null,
      });
      if (r.ok) {
        setEditing(null);
        setFlash(r.message ?? "Producción corregida.");
      } else {
        setError(r.error);
      }
      setBusyId(null);
    });
  };

  const remove = (id: string) => {
    setBusyId(id);
    start(async () => {
      setError(null);
      setFlash(null);
      const r = await eliminarProduccion(id);
      if (r.ok) setFlash(r.message ?? "Producción eliminada.");
      else setError(r.error);
      setBusyId(null);
    });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-negro)]/10 bg-white">
      {error && (
        <p className="border-b border-[var(--color-rojo)]/20 bg-[var(--color-rojo)]/5 px-4 py-2.5 text-body-sm text-[var(--color-rojo)]">
          {error}
        </p>
      )}
      {flash && (
        <p className="border-b border-[#16a34a]/20 bg-[#16a34a]/5 px-4 py-2.5 text-body-sm text-[#16a34a]">
          {flash}
        </p>
      )}
      <table className="w-full text-left text-body-sm">
        <thead className="border-b border-[var(--color-negro)]/10 text-caption text-[var(--color-gris-500)]">
          <tr>
            <th className="px-4 py-2.5 font-normal">Fecha</th>
            <th className="px-4 py-2.5 font-normal">Sabor</th>
            <th className="px-4 py-2.5 text-right font-normal">Cantidad</th>
            <th className="px-4 py-2.5 font-normal">Lote</th>
            <th className="px-4 py-2.5 font-normal">Vence</th>
            <th className="px-4 py-2.5 text-right font-normal">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-negro)]/5">
          {movimientos.map((m) => {
            const isEdit = editing === m.id;
            const rowBusy = busyId === m.id;
            return (
              <tr key={m.id} className={isEdit ? "bg-[var(--color-negro)]/[0.02]" : ""}>
                <td className="px-4 py-2.5 text-[var(--color-gris-500)]">
                  {formatFechaHora(m.createdAt)}
                </td>
                <td className="px-4 py-2.5 font-medium">{m.sabor}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">
                  {isEdit ? (
                    <input
                      type="number"
                      min={1}
                      step={1}
                      value={cantidad}
                      onChange={(e) => setCantidad(e.target.value)}
                      className={`${cellInput} text-right`}
                    />
                  ) : (
                    `+${m.cantidad}`
                  )}
                </td>
                <td className="px-4 py-2.5">
                  {isEdit ? (
                    <input
                      type="text"
                      value={lote}
                      onChange={(e) => setLote(e.target.value)}
                      className={cellInput}
                      placeholder="—"
                    />
                  ) : (
                    (m.lote ?? "—")
                  )}
                </td>
                <td className="px-4 py-2.5">
                  {isEdit ? (
                    <input
                      type="date"
                      value={venc}
                      onChange={(e) => setVenc(e.target.value)}
                      className={cellInput}
                    />
                  ) : (
                    formatFecha(m.vencimiento)
                  )}
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center justify-end gap-1.5">
                    {isEdit ? (
                      <>
                        <button
                          type="button"
                          onClick={() => save(m.id)}
                          disabled={rowBusy}
                          aria-label="Guardar"
                          className="inline-flex size-8 items-center justify-center rounded-lg bg-[#16a34a] text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                        >
                          <Check className="size-4" strokeWidth={2.5} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditing(null)}
                          disabled={rowBusy}
                          aria-label="Cancelar"
                          className="inline-flex size-8 items-center justify-center rounded-lg border border-[var(--color-negro)]/15 transition-colors hover:bg-[var(--color-negro)]/5 disabled:opacity-50"
                        >
                          <X className="size-4" strokeWidth={2.5} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => beginEdit(m)}
                          disabled={rowBusy}
                          aria-label="Editar"
                          className="inline-flex size-8 items-center justify-center rounded-lg border border-[var(--color-negro)]/15 text-[var(--color-gris-500)] transition-colors hover:bg-[var(--color-negro)]/5 hover:text-[var(--color-negro)] disabled:opacity-50"
                        >
                          <Pencil className="size-4" strokeWidth={2.25} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              window.confirm(
                                `¿Eliminar esta producción de ${m.cantidad} ${m.sabor}? Se descuenta del stock.`,
                              )
                            )
                              remove(m.id);
                          }}
                          disabled={rowBusy}
                          aria-label="Eliminar"
                          className="inline-flex size-8 items-center justify-center rounded-lg border border-[var(--color-rojo)]/20 text-[var(--color-rojo)] transition-colors hover:bg-[var(--color-rojo)]/10 disabled:opacity-50"
                        >
                          <Trash2 className="size-4" strokeWidth={2.25} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
