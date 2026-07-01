import { formatBs } from "@/lib/admin/format";
import type { PedidoItem } from "@/lib/admin/types";

// Desglose transparente de una cuenta: una línea por sabor
// (cantidad × precio unitario = subtotal) y el total al final.
export function Desglose({
  items,
  total,
  compact = false,
}: {
  items: PedidoItem[];
  total: number;
  compact?: boolean;
}) {
  if (!items || items.length === 0) {
    return <p className="text-body-sm text-[var(--color-gris-500)]">—</p>;
  }

  return (
    <div
      className={`rounded-xl border border-[var(--color-negro)]/10 bg-[var(--color-negro)]/[0.02] ${
        compact ? "px-3 py-2" : "px-3.5 py-3"
      }`}
    >
      <ul className="grid gap-1">
        {items.map((it, i) => (
          <li
            key={`${it.sabor}-${i}`}
            className="flex items-baseline justify-between gap-3 text-body-sm"
          >
            <span className="text-[var(--color-gris-500)]">
              <span className="font-semibold text-[var(--color-negro)]">{it.cantidad}</span>
              {" × "}
              {it.sabor}
              {it.precioUnit != null && (
                <span className="text-[var(--color-gris-500)]">
                  {" "}
                  · {formatBs(it.precioUnit)} c/u
                </span>
              )}
            </span>
            <span className="shrink-0 tabular-nums">
              {formatBs(it.subtotal != null ? it.subtotal : (it.precioUnit ?? 0) * it.cantidad)}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-1.5 flex items-baseline justify-between gap-3 border-t border-[var(--color-negro)]/10 pt-1.5">
        <span className="text-caption text-[var(--color-gris-500)]">Total</span>
        <span className="font-display text-lg leading-none tabular-nums">{formatBs(total)}</span>
      </div>
    </div>
  );
}
