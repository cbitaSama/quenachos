"use client";

import { useState, useTransition } from "react";
import { actualizarPrecios } from "@/lib/admin/actions";
import type { PrecioRow } from "@/lib/admin/types";

type Draft = {
  sinFactura: string;
  conFactura: string;
  provSinFactura: string;
  provConFactura: string;
};

function toDraft(p: PrecioRow): Draft {
  return {
    sinFactura: String(p.precioSinFactura ?? ""),
    conFactura: String(p.precioConFactura ?? ""),
    provSinFactura: String(p.precioProvSinFactura ?? ""),
    provConFactura: String(p.precioProvConFactura ?? ""),
  };
}

const priceInput =
  "w-full rounded-xl border border-[var(--color-negro)]/15 bg-white px-3 py-2.5 text-body-md tabular-nums outline-none transition-colors focus:border-[var(--color-rojo)]";

export function PreciosForm({ precios }: { precios: PrecioRow[] }) {
  const [drafts, setDrafts] = useState<Record<string, Draft>>(() =>
    Object.fromEntries(precios.map((p) => [p.id, toDraft(p)])),
  );
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<Record<string, { ok: boolean; text: string }>>({});
  const [, start] = useTransition();

  const set = (id: string, key: keyof Draft, value: string) =>
    setDrafts((d) => ({ ...d, [id]: { ...d[id], [key]: value } }));

  const guardar = (p: PrecioRow) => {
    const d = drafts[p.id];
    setPendingId(p.id);
    start(async () => {
      const r = await actualizarPrecios({
        saborId: p.id,
        sinFactura: Number(d.sinFactura),
        conFactura: Number(d.conFactura),
        provSinFactura: Number(d.provSinFactura),
        provConFactura: Number(d.provConFactura),
      });
      setMsg((m) => ({
        ...m,
        [p.id]: r.ok ? { ok: true, text: r.message ?? "Guardado" } : { ok: false, text: r.error },
      }));
      setPendingId(null);
    });
  };

  return (
    <div className="grid gap-4">
      {precios.map((p) => {
        const d = drafts[p.id];
        const m = msg[p.id];
        const busy = pendingId === p.id;
        return (
          <div
            key={p.id}
            className="rounded-2xl border border-[var(--color-negro)]/10 bg-white p-4 sm:p-5"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="font-display text-2xl leading-none">{p.nombre}</h3>
              <button
                type="button"
                onClick={() => guardar(p)}
                disabled={busy}
                className="inline-flex items-center justify-center rounded-full bg-[var(--color-rojo)] px-5 py-2.5 text-body-sm font-bold text-[var(--color-crema)] transition-all hover:bg-[var(--color-rojo-oscuro)] disabled:opacity-50"
              >
                {busy ? "Guardando…" : "Guardar"}
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-3 rounded-xl bg-[var(--color-negro)]/[0.02] p-3">
                <p className="text-caption text-[var(--color-gris-500)]">
                  Cliente normal (menos de 25)
                </p>
                <label className="flex flex-col gap-1">
                  <span className="text-body-sm text-[var(--color-gris-500)]">Sin factura</span>
                  <input
                    type="number"
                    min={0}
                    step="0.5"
                    inputMode="decimal"
                    value={d.sinFactura}
                    onChange={(e) => set(p.id, "sinFactura", e.target.value)}
                    className={priceInput}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-body-sm text-[var(--color-gris-500)]">Con factura</span>
                  <input
                    type="number"
                    min={0}
                    step="0.5"
                    inputMode="decimal"
                    value={d.conFactura}
                    onChange={(e) => set(p.id, "conFactura", e.target.value)}
                    className={priceInput}
                  />
                </label>
              </div>

              <div className="grid gap-3 rounded-xl bg-[var(--color-rojo)]/[0.04] p-3">
                <p className="text-caption text-[var(--color-gris-500)]">
                  Proveedor (25 o más)
                </p>
                <label className="flex flex-col gap-1">
                  <span className="text-body-sm text-[var(--color-gris-500)]">Sin factura</span>
                  <input
                    type="number"
                    min={0}
                    step="0.5"
                    inputMode="decimal"
                    value={d.provSinFactura}
                    onChange={(e) => set(p.id, "provSinFactura", e.target.value)}
                    className={priceInput}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-body-sm text-[var(--color-gris-500)]">Con factura</span>
                  <input
                    type="number"
                    min={0}
                    step="0.5"
                    inputMode="decimal"
                    value={d.provConFactura}
                    onChange={(e) => set(p.id, "provConFactura", e.target.value)}
                    className={priceInput}
                  />
                </label>
              </div>
            </div>

            {m && (
              <p
                className={`mt-3 text-body-sm ${m.ok ? "text-[#16a34a]" : "text-[var(--color-rojo)]"}`}
              >
                {m.text}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
