"use client";

import { useMemo, useState } from "react";
import type { PedidoAdmin } from "@/lib/admin/types";
import { formatBs, formatFechaHora } from "@/lib/admin/format";
import { Badge, EmptyState } from "@/components/admin/ui";
import { ConfirmarButton } from "./confirmar-button";

// Ahora separamos por TIPO DE CLIENTE (no por estado, que mareaba).
const GRUPOS = [
  { key: "todos", label: "Todos" },
  { key: "distribuidoras", label: "Distribuidoras" },
  { key: "clientes", label: "Clientes" },
] as const;

type GrupoKey = (typeof GRUPOS)[number]["key"];

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

const esDistribuidora = (p: PedidoAdmin) => p.modalidadPago === "cuenta_corriente";

// Un pedido "por atender" = requiere acción del dueño (confirmar pago o despachar).
const porAtender = (p: PedidoAdmin) =>
  p.estado === "comprobante_recibido" ||
  (p.estado === "pendiente_pago" && p.modalidadPago === "cuenta_corriente");

function enGrupo(p: PedidoAdmin, grupo: GrupoKey) {
  if (grupo === "todos") return true;
  if (grupo === "distribuidoras") return esDistribuidora(p);
  return !esDistribuidora(p);
}

export function PedidosClient({ pedidos }: { pedidos: PedidoAdmin[] }) {
  const [grupo, setGrupo] = useState<GrupoKey>("todos");
  const [soloPendientes, setSoloPendientes] = useState(false);
  const [q, setQ] = useState("");

  const filtrados = useMemo(() => {
    return pedidos
      .filter((p) => {
        if (!enGrupo(p, grupo)) return false;
        if (soloPendientes && !porAtender(p)) return false;
        if (q) {
          const hay = `${p.cliente ?? ""} ${p.telefono ?? ""} ${p.origen}`.toLowerCase();
          if (!hay.includes(q.toLowerCase())) return false;
        }
        return true;
      })
      // Primero lo que necesita atención, luego por fecha (más nuevo arriba).
      .sort((a, b) => {
        const pa = Number(porAtender(b)) - Number(porAtender(a));
        if (pa !== 0) return pa;
        return b.createdAt.localeCompare(a.createdAt);
      });
  }, [pedidos, grupo, soloPendientes, q]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {GRUPOS.map((g) => {
          const delGrupo = pedidos.filter((p) => enGrupo(p, g.key));
          const atender = delGrupo.filter(porAtender).length;
          const activo = grupo === g.key;
          return (
            <button
              key={g.key}
              type="button"
              onClick={() => setGrupo(g.key)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-body-sm font-semibold transition-colors ${
                activo
                  ? "bg-[var(--color-negro)] text-[var(--color-crema)]"
                  : "bg-white text-[var(--color-gris-500)] hover:text-[var(--color-negro)]"
              }`}
            >
              {g.label}
              <span className="opacity-60">{delGrupo.length}</span>
              {atender > 0 && (
                <span
                  className="inline-flex min-w-[18px] items-center justify-center rounded-full bg-[var(--color-rojo)] px-1.5 text-[11px] font-bold leading-none text-white"
                  title={`${atender} por atender`}
                >
                  {atender}
                </span>
              )}
            </button>
          );
        })}

        <label className="ml-auto flex cursor-pointer select-none items-center gap-1.5 text-body-sm text-[var(--color-gris-500)]">
          <input
            type="checkbox"
            checked={soloPendientes}
            onChange={(e) => setSoloPendientes(e.target.checked)}
            className="size-3.5 accent-[var(--color-rojo)]"
          />
          Solo por atender
        </label>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar cliente…"
          className="rounded-full border border-[var(--color-negro)]/15 bg-white px-4 py-1.5 text-body-sm outline-none focus:border-[var(--color-rojo)]"
        />
      </div>

      {filtrados.length === 0 ? (
        <EmptyState>No hay pedidos en esta vista.</EmptyState>
      ) : (
        <ul className="space-y-2">
          {filtrados.map((p) => {
            const atender = porAtender(p);
            return (
              <li
                key={p.id}
                className={`flex items-center justify-between gap-3 rounded-2xl border bg-white px-4 py-3 transition-colors ${
                  atender
                    ? "border-[var(--color-rojo)]/40 ring-1 ring-[var(--color-rojo)]/20"
                    : "border-[var(--color-negro)]/10"
                }`}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-body-md font-semibold">
                      {p.cliente ?? "Cliente web"}
                    </p>
                    <Badge tone={esDistribuidora(p) ? "info" : "neutral"}>
                      {esDistribuidora(p) ? "Distribuidora" : "Cliente"}
                    </Badge>
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
                  <div className="flex shrink-0 items-center gap-2.5">
                    {p.comprobanteUrl ? (
                      <a
                        href={p.comprobanteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Ver comprobante completo"
                        className="block shrink-0"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.comprobanteUrl}
                          alt="Comprobante de pago"
                          className="size-14 rounded-lg border border-[var(--color-negro)]/15 object-cover transition-transform hover:scale-105"
                        />
                      </a>
                    ) : (
                      <span className="text-[11px] text-[var(--color-gris-500)]">
                        sin imagen
                      </span>
                    )}
                    <ConfirmarButton pedidoId={p.id} />
                  </div>
                )}
                {p.estado === "pendiente_pago" &&
                  p.modalidadPago === "cuenta_corriente" && (
                    <ConfirmarButton pedidoId={p.id} label="Despachar" />
                  )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
