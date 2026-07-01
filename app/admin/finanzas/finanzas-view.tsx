"use client";

import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { formatBs } from "@/lib/admin/format";
import { KpiCard, EmptyState } from "@/components/admin/ui";
import type { FinanzasData } from "@/lib/admin/types";

const MODOS: { key: string; label: string }[] = [
  { key: "mensual", label: "Mensual" },
  { key: "trimestral", label: "Trimestral" },
  { key: "semestral", label: "Semestral" },
  { key: "anual", label: "Anual" },
];

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

// Etiqueta corta de un bucket según el modo, a partir de su fecha de inicio (YYYY-MM-DD).
function labelBucket(inicio: string, modo: string): string {
  const [y, m] = inicio.slice(0, 10).split("-").map(Number);
  if (modo === "anual") return String(y);
  if (modo === "semestral") return `${m <= 6 ? "S1" : "S2"} ${y}`;
  if (modo === "trimestral") return `T${Math.floor((m - 1) / 3) + 1} ${y}`;
  return `${MESES[m - 1]} ${String(y).slice(2)}`;
}

export function FinanzasView({ data, modo }: { data: FinanzasData | null; modo: string }) {
  const router = useRouter();
  const reduce = useReducedMotion();

  const buckets = data?.buckets ?? [];
  const totales = data?.totales ?? { ingresos: 0, egresos: 0, neto: 0 };
  const porCat = data?.porCategoria ?? [];
  const max = Math.max(1, ...buckets.flatMap((b) => [b.ingresos, b.egresos]));

  return (
    <div className="space-y-7">
      <header>
        <h1 className="font-display text-display-md uppercase leading-none">Finanzas</h1>
        <p className="mt-1 text-body-sm text-[var(--color-gris-500)]">
          Ingresos vs egresos por período. Los ingresos son las ventas entregadas; los egresos, lo cargado en Gastos.
        </p>
      </header>

      {/* Selector de período */}
      <div className="flex flex-wrap gap-2">
        {MODOS.map((m) => {
          const active = m.key === modo;
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => router.push(`/admin/finanzas?modo=${m.key}`)}
              className={`rounded-full px-4 py-2 text-body-sm font-semibold transition-colors ${
                active
                  ? "bg-[var(--color-rojo)] text-[var(--color-crema)]"
                  : "border border-[var(--color-negro)]/15 bg-white text-[var(--color-gris-500)] hover:bg-[var(--color-negro)]/5"
              }`}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      {/* KPIs del período mostrado */}
      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard label="Ingresos" value={formatBs(totales.ingresos)} tone="ok" />
        <KpiCard label="Egresos" value={formatBs(totales.egresos)} tone="danger" />
        <KpiCard
          label="Neto"
          value={formatBs(totales.neto)}
          tone={totales.neto >= 0 ? "ok" : "danger"}
          hint={totales.neto >= 0 ? "ganancia" : "pérdida"}
        />
      </div>

      {/* Barras ingresos vs egresos por bucket */}
      <section className="rounded-2xl border border-[var(--color-negro)]/10 bg-white p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <p className="text-caption text-[var(--color-gris-500)]">Ingresos vs egresos</p>
          <div className="flex items-center gap-3 text-[11px] text-[var(--color-gris-500)]">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-[#16a34a]" /> Ingresos
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-[var(--color-rojo)]" /> Egresos
            </span>
          </div>
        </div>

        {buckets.length === 0 ? (
          <p className="mt-4 text-body-sm text-[var(--color-gris-500)]">Sin datos.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {buckets.map((b, i) => (
              <div key={b.inicio} className="grid grid-cols-[64px_1fr_auto] items-center gap-3">
                <span className="truncate text-body-sm">{labelBucket(b.inicio, modo)}</span>
                <div className="space-y-1.5">
                  <Bar pct={(b.ingresos / max) * 100} color="#16a34a" delay={reduce ? 0 : i * 0.05} />
                  <Bar
                    pct={(b.egresos / max) * 100}
                    color="var(--color-rojo)"
                    delay={reduce ? 0 : i * 0.05 + 0.04}
                  />
                </div>
                <span
                  className={`text-right text-body-sm tabular-nums ${
                    b.neto >= 0 ? "text-[#16a34a]" : "text-[var(--color-rojo)]"
                  }`}
                >
                  {formatBs(b.neto)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Desglose de egresos por categoría */}
      <section>
        <h2 className="mb-3 text-caption text-[var(--color-gris-500)]">
          Egresos por categoría (período mostrado)
        </h2>
        {porCat.length === 0 ? (
          <EmptyState>No hay gastos en este período.</EmptyState>
        ) : (
          <ul className="divide-y divide-[var(--color-negro)]/5 overflow-hidden rounded-2xl border border-[var(--color-negro)]/10 bg-white">
            {porCat.map((c) => (
              <li
                key={c.categoria}
                className="flex items-center justify-between px-4 py-3 text-body-sm"
              >
                <span className="font-medium">{c.categoria}</span>
                <span className="tabular-nums text-[var(--color-gris-500)]">{formatBs(c.total)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Bar({ pct, color, delay }: { pct: number; color: string; delay: number }) {
  return (
    <div className="h-2.5 overflow-hidden rounded-full bg-[var(--color-negro)]/5">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, pct)}%` }}
        transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}
