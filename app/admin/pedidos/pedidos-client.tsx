"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";
import { Check, Trash2 } from "lucide-react";
import type { PedidoAdmin } from "@/lib/admin/types";
import { confirmarPedido, eliminarPedido } from "@/lib/admin/actions";
import { formatBs, formatFechaHora } from "@/lib/admin/format";
import { Badge, EmptyState } from "@/components/admin/ui";

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

// Mutaciones optimistas: el pedido reacciona al instante mientras el guardado
// (y el WhatsApp al cliente) siguen por detrás. Si falla, se revierte solo.
type OptAccion = { tipo: "borrar"; id: string } | { tipo: "despachar"; id: string };

export function PedidosClient({ pedidos }: { pedidos: PedidoAdmin[] }) {
  const [grupo, setGrupo] = useState<GrupoKey>("todos");
  const [soloPendientes, setSoloPendientes] = useState(false);
  const [q, setQ] = useState("");
  const [, start] = useTransition();
  const [aviso, setAviso] = useState<{ id: string; text: string } | null>(null);

  const [lista, aplicar] = useOptimistic(pedidos, (state, a: OptAccion) =>
    a.tipo === "borrar"
      ? state.filter((p) => p.id !== a.id)
      : state.map((p) => (p.id === a.id ? { ...p, estado: "despachado" } : p)),
  );

  function correr(id: string, accion: () => Promise<{ ok: boolean; error?: string }>, opt: OptAccion) {
    start(async () => {
      setAviso(null);
      aplicar(opt);
      const r = await accion();
      if (!r.ok) setAviso({ id, text: r.error ?? "No se pudo." });
    });
  }

  const filtrados = useMemo(() => {
    return lista
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
  }, [lista, grupo, soloPendientes, q]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {GRUPOS.map((g) => {
          const delGrupo = lista.filter((p) => enGrupo(p, g.key));
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
          {filtrados.map((p) => (
            <FilaPedido
              key={p.id}
              p={p}
              aviso={aviso?.id === p.id ? aviso.text : null}
              onConfirmar={() =>
                correr(p.id, () => confirmarPedido(p.id), { tipo: "despachar", id: p.id })
              }
              onEliminar={() =>
                correr(p.id, () => eliminarPedido(p.id), { tipo: "borrar", id: p.id })
              }
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function FilaPedido({
  p,
  aviso,
  onConfirmar,
  onEliminar,
}: {
  p: PedidoAdmin;
  aviso: string | null;
  onConfirmar: () => void;
  onEliminar: () => void;
}) {
  const atender = porAtender(p);
  return (
    <li
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
        {aviso && (
          <p className="mt-1 text-[11px] text-[var(--color-rojo)]">{aviso}</p>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2">
        {p.estado === "comprobante_recibido" && (
          <div className="flex items-center gap-2.5">
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
              <span className="text-[11px] text-[var(--color-gris-500)]">sin imagen</span>
            )}
            <AccionPrincipal onClick={onConfirmar} label="Confirmar pago" />
          </div>
        )}
        {p.estado === "pendiente_pago" && p.modalidadPago === "cuenta_corriente" && (
          <AccionPrincipal onClick={onConfirmar} label="Despachar" />
        )}

        <EliminarPedidoBtn onEliminar={onEliminar} />
      </div>
    </li>
  );
}

// Botón de acción principal (confirmar / despachar). Reacciona al instante: la
// fila cambia de estado por la UI optimista mientras el guardado va por detrás.
function AccionPrincipal({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-rojo)] px-4 py-2 text-body-sm font-bold text-[var(--color-crema)] transition-all hover:bg-[var(--color-rojo-oscuro)] active:scale-95"
    >
      <Check className="size-4" strokeWidth={2.75} />
      {label}
    </button>
  );
}

function EliminarPedidoBtn({ onEliminar }: { onEliminar: () => void }) {
  const [confirm, setConfirm] = useState(false);

  if (!confirm) {
    return (
      <button
        type="button"
        onClick={() => setConfirm(true)}
        className="inline-flex items-center gap-1.5 text-[11px] text-[var(--color-gris-500)] hover:text-[var(--color-rojo)]"
      >
        <Trash2 className="size-3.5" strokeWidth={2.25} /> Eliminar
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2 text-[11px]">
      <span className="text-[var(--color-rojo)]">¿Borrar? Devuelve el stock.</span>
      <button
        type="button"
        onClick={() => {
          setConfirm(false);
          onEliminar();
        }}
        className="rounded-full bg-[var(--color-rojo)] px-3 py-1 font-bold text-white active:scale-95"
      >
        Sí, borrar
      </button>
      <button
        type="button"
        onClick={() => setConfirm(false)}
        className="text-[var(--color-gris-500)]"
      >
        Cancelar
      </button>
    </div>
  );
}
