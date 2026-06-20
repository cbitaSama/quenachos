"use client";

import { useMemo, useState } from "react";
import type { PedidoAdmin } from "@/lib/admin/types";
import { formatBs, formatFechaHora } from "@/lib/admin/format";
import { Badge, EmptyState } from "@/components/admin/ui";
import { ConfirmarButton } from "./confirmar-button";

const FILTROS = [
  { key: "comprobante_recibido", label: "Por confirmar" },
  { key: "pendiente_pago", label: "Pendientes" },
  { key: "despachado", label: "Despachados" },
  { key: "todos", label: "Todos" },
] as const;

const ESTADO_TONE: Record<string, "warn" | "info" | "ok" | "neutral" | "danger"> = {
  pendiente_pago: "neutral",
  comprobante_recibido: "warn",
  confirmado: "info",
  despachado: "ok",
  cancelado: "danger",
};

const ESTADO_LABEL: Record<string, string> = {
  pendiente_pago: "Pendiente de pago",
  comprobante_recibido: "Comprobante recibido",
  confirmado: "Confirmado",
  despachado: "Despachado",
  cancelado: "Cancelado",
};

export function PedidosClient({ pedidos }: { pedidos: PedidoAdmin[] }) {
  const [filtro, setFiltro] = useState<string>("comprobante_recibido");
  const [q, setQ] = useState("");

  const filtrados = useMemo(() => {
    return pedidos.filter((p) => {
      if (filtro !== "todos" && p.estado !== filtro) return false;
      if (q) {
        const hay = `${p.cliente ?? ""} ${p.telefono ?? ""} ${p.origen}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [pedidos, filtro, q]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {FILTROS.map((f) => {
          const count =
            f.key === "todos"
              ? pedidos.length
              : pedidos.filter((p) => p.estado === f.key).length;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFiltro(f.key)}
              className={`rounded-full px-3.5 py-1.5 text-body-sm font-semibold transition-colors ${
                filtro === f.key
                  ? "bg-[var(--color-negro)] text-[var(--color-crema)]"
                  : "bg-white text-[var(--color-gris-500)] hover:text-[var(--color-negro)]"
              }`}
            >
              {f.label}
              <span className="ml-1.5 opacity-60">{count}</span>
            </button>
          );
        })}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar cliente…"
          className="ml-auto rounded-full border border-[var(--color-negro)]/15 bg-white px-4 py-1.5 text-body-sm outline-none focus:border-[var(--color-rojo)]"
        />
      </div>

      {filtrados.length === 0 ? (
        <EmptyState>No hay pedidos en esta vista.</EmptyState>
      ) : (
        <ul className="space-y-2">
          {filtrados.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--color-negro)]/10 bg-white px-4 py-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-body-md font-semibold">
                    {p.cliente ?? "Cliente web"}
                  </p>
                  <Badge tone={ESTADO_TONE[p.estado] ?? "neutral"}>
                    {ESTADO_LABEL[p.estado] ?? p.estado}
                  </Badge>
                </div>
                <p className="text-body-sm text-[var(--color-gris-500)]">
                  {formatBs(p.totalBs)} ·{" "}
                  {p.items.map((it) => `${it.sabor} x${it.cantidad}`).join(", ") || "—"}
                </p>
                <p className="text-[11px] text-[var(--color-gris-500)]">
                  {p.origen} · {formatFechaHora(p.createdAt)}
                </p>
                {(p.telefono || p.direccionTexto || p.gpsUrl) && (
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[var(--color-gris-500)]">
                    {p.telefono && <span>📞 {p.telefono}</span>}
                    {p.direccionTexto && <span>📍 {p.direccionTexto}</span>}
                    {p.gpsUrl && /^https?:\/\//i.test(p.gpsUrl) && (
                      <a
                        href={p.gpsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-[var(--color-rojo)] underline underline-offset-2"
                      >
                        Ver GPS
                      </a>
                    )}
                  </div>
                )}
              </div>
              {p.estado === "comprobante_recibido" && (
                <ConfirmarButton pedidoId={p.id} />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
