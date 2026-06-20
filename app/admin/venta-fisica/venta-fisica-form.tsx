"use client";

import { useMemo, useState, useTransition } from "react";
import { Minus, Plus } from "lucide-react";
import { registrarVentaFisica } from "@/lib/admin/actions";
import { formatBs } from "@/lib/admin/format";
import { Field, inputClass } from "@/components/admin/ui";
import type { SaborPrecio } from "@/lib/admin/types";

export function VentaFisicaForm({ sabores }: { sabores: SaborPrecio[] }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [cant, setCant] = useState<Record<string, number>>({});
  const [nota, setNota] = useState("");

  const set = (id: string, n: number) =>
    setCant((c) => ({ ...c, [id]: Math.max(0, n) }));

  const total = useMemo(
    () => sabores.reduce((s, sb) => s + (cant[sb.id] ?? 0) * sb.precio, 0),
    [cant, sabores],
  );
  const totalBolsas = useMemo(
    () => Object.values(cant).reduce((s, n) => s + (n ?? 0), 0),
    [cant],
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          setMsg(null);
          const items = sabores
            .filter((s) => (cant[s.id] ?? 0) > 0)
            .map((s) => ({ saborId: s.id, cantidad: cant[s.id] }));
          const r = await registrarVentaFisica({ items, nota: nota || null });
          setMsg(r.ok ? { ok: true, text: r.message ?? "Listo" } : { ok: false, text: r.error });
          if (r.ok) {
            setCant({});
            setNota("");
          }
        });
      }}
      className="grid gap-5"
    >
      <ul className="divide-y divide-[var(--color-negro)]/5">
        {sabores.map((s) => {
          const n = cant[s.id] ?? 0;
          return (
            <li
              key={s.id}
              className="flex items-center justify-between gap-3 py-3 first:pt-0"
            >
              <div>
                <p className="text-body-md font-medium">{s.nombre}</p>
                <p className="text-body-sm text-[var(--color-gris-500)]">
                  {formatBs(s.precio)} c/u
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => set(s.id, n - 1)}
                  aria-label={`Quitar ${s.nombre}`}
                  disabled={n <= 0}
                  className="inline-flex size-9 items-center justify-center rounded-full border border-[var(--color-negro)]/15 transition-colors hover:bg-[var(--color-negro)]/5 disabled:opacity-40"
                >
                  <Minus className="size-4" strokeWidth={2.5} />
                </button>
                <input
                  type="number"
                  min={0}
                  value={n === 0 ? "" : n}
                  onChange={(e) => set(s.id, Math.floor(Number(e.target.value) || 0))}
                  placeholder="0"
                  className="w-14 rounded-xl border border-[var(--color-negro)]/15 bg-white px-2 py-2 text-center text-body-md tabular-nums outline-none focus:border-[var(--color-rojo)]"
                />
                <button
                  type="button"
                  onClick={() => set(s.id, n + 1)}
                  aria-label={`Agregar ${s.nombre}`}
                  className="inline-flex size-9 items-center justify-center rounded-full border border-[var(--color-negro)]/15 transition-colors hover:bg-[var(--color-negro)]/5"
                >
                  <Plus className="size-4" strokeWidth={2.5} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <Field label="Nota (opcional) — ej. quién se lo llevó">
        <input
          type="text"
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          className={inputClass}
          placeholder="Ej. Juan (trabajador)"
        />
      </Field>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[var(--color-negro)]/[0.03] px-4 py-3">
        <span className="text-body-sm text-[var(--color-gris-500)]">
          {totalBolsas} {totalBolsas === 1 ? "bolsa" : "bolsas"}
        </span>
        <span className="font-display text-3xl leading-none">{formatBs(total)}</span>
      </div>

      <div>
        <button
          type="submit"
          disabled={pending || totalBolsas === 0}
          className="inline-flex w-full items-center justify-center rounded-full bg-[var(--color-rojo)] px-6 py-3.5 text-base font-bold text-[var(--color-crema)] transition-all hover:bg-[var(--color-rojo-oscuro)] disabled:opacity-50 sm:w-auto"
        >
          {pending ? "Registrando…" : "Registrar venta"}
        </button>
        {msg && (
          <p
            className={`mt-3 text-body-sm ${msg.ok ? "text-[#16a34a]" : "text-[var(--color-rojo)]"}`}
          >
            {msg.text}
          </p>
        )}
      </div>
    </form>
  );
}
