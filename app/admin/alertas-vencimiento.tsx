import type { LoteAlerta } from "@/lib/admin/types";
import { estadoVencimiento, formatFecha } from "@/lib/admin/format";

export function AlertasVencimiento({ lotes }: { lotes: LoteAlerta[] }) {
  const alertas = lotes
    .map((l) => ({ ...l, ...estadoVencimiento(l.vencimiento) }))
    .filter((l) => l.estado !== "ok")
    .sort((a, b) => a.dias - b.dias);

  if (alertas.length === 0) return null;

  return (
    <section className="rounded-2xl border border-[#f59e0b]/40 bg-[#fffbeb] p-4 sm:p-5">
      <p className="text-caption text-[#b45309]">⚠ Lotes por vencer / vencidos</p>
      <ul className="mt-3 space-y-2">
        {alertas.map((l) => {
          const vencido = l.estado === "vencido";
          return (
            <li
              key={`${l.saborId}-${l.lote}-${l.vencimiento}`}
              className="flex items-center justify-between gap-3 rounded-xl bg-white px-3.5 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-body-md font-semibold">
                  {l.sabor}
                  {l.lote ? (
                    <span className="text-[var(--color-gris-500)]"> · lote {l.lote}</span>
                  ) : null}
                </p>
                <p className="text-body-sm text-[var(--color-gris-500)]">
                  {l.cantidad} bolsas · vence {formatFecha(l.vencimiento)}
                </p>
              </div>
              <span
                className="shrink-0 rounded-full px-2.5 py-1 text-body-sm font-semibold"
                style={{
                  backgroundColor: vencido ? "rgba(217,40,47,0.12)" : "rgba(245,158,11,0.18)",
                  color: vencido ? "#D9282F" : "#b45309",
                }}
              >
                {vencido
                  ? `Vencido hace ${Math.abs(l.dias)}d`
                  : `Vence en ${l.dias}d`}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
