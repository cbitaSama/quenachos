"use client";

import { motion, useReducedMotion } from "motion/react";
import type { PorSabor } from "@/lib/admin/types";

export function ProduccionChart({ porSabor }: { porSabor: PorSabor[] }) {
  const reduce = useReducedMotion();
  const max = Math.max(
    1,
    ...porSabor.flatMap((s) => [s.producido, s.despachado]),
  );

  return (
    <section className="rounded-2xl border border-[var(--color-negro)]/10 bg-white p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <p className="text-caption text-[var(--color-gris-500)]">
          Producido vs despachado · hoy
        </p>
        <div className="flex items-center gap-3 text-[11px] text-[var(--color-gris-500)]">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-[#F11C1F]" /> Producido
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-[#A3E635]" /> Despachado
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {porSabor.map((s, i) => (
          <div key={s.id} className="grid grid-cols-[90px_1fr_auto] items-center gap-3">
            <span className="truncate text-body-sm">{s.nombre}</span>
            <div className="space-y-1.5">
              <Bar pct={(s.producido / max) * 100} color="#F11C1F" delay={reduce ? 0 : i * 0.06} />
              <Bar pct={(s.despachado / max) * 100} color="#A3E635" delay={reduce ? 0 : i * 0.06 + 0.05} />
            </div>
            <span className="text-right text-body-sm tabular-nums text-[var(--color-gris-500)]">
              {s.producido}/{s.despachado}
            </span>
          </div>
        ))}
        {porSabor.length === 0 && (
          <p className="text-body-sm text-[var(--color-gris-500)]">Sin movimientos hoy.</p>
        )}
      </div>
    </section>
  );
}

function Bar({ pct, color, delay }: { pct: number; color: string; delay: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-[var(--color-negro)]/5">
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
