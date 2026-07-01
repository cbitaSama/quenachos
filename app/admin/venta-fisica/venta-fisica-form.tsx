"use client";

import { useMemo, useState, useTransition } from "react";
import { Minus, Plus } from "lucide-react";
import { registrarVentaDirecta } from "@/lib/admin/actions";
import { formatBs } from "@/lib/admin/format";
import { Field, inputClass } from "@/components/admin/ui";
import type { CuentaVentaOption, SaborPrecio } from "@/lib/admin/types";

const UMBRAL_PROVEEDOR = 25; // desde esta cantidad de bolsas se aplica precio proveedor

export function VentaFisicaForm({
  sabores,
  cuentas,
}: {
  sabores: SaborPrecio[];
  cuentas: CuentaVentaOption[];
}) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [cant, setCant] = useState<Record<string, number>>({});
  const [nota, setNota] = useState("");
  const [clienteId, setClienteId] = useState(""); // "" = mostrador
  const [conFactura, setConFactura] = useState(false);

  const set = (id: string, n: number) =>
    setCant((c) => ({ ...c, [id]: Math.max(0, n) }));

  const totalBolsas = useMemo(
    () => Object.values(cant).reduce((s, n) => s + (n ?? 0), 0),
    [cant],
  );

  const esProveedor = totalBolsas >= UMBRAL_PROVEEDOR;
  const cuentaSel = cuentas.find((c) => c.clienteId === clienteId) ?? null;

  // Al elegir destinatario, el default de factura sale del NIT de la cuenta
  // (con NIT → con factura; mostrador o sin NIT → sin factura). Darko puede cambiarlo.
  const elegirDestino = (id: string) => {
    setClienteId(id);
    const c = cuentas.find((x) => x.clienteId === id) ?? null;
    setConFactura(Boolean(c?.nit));
  };

  // Precio unitario según el tier vigente (4 tiers, mismo criterio que la base y el bot).
  const precioUnit = (s: SaborPrecio): number => {
    if (esProveedor) return conFactura ? s.precioProveedorFactura : s.precioProveedor;
    return conFactura ? s.precio : s.precioSinFactura;
  };

  const total = useMemo(
    () => sabores.reduce((s, sb) => s + (cant[sb.id] ?? 0) * precioUnit(sb), 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cant, sabores, esProveedor, conFactura],
  );

  const submit = () =>
    start(async () => {
      setMsg(null);
      const items = sabores
        .filter((s) => (cant[s.id] ?? 0) > 0)
        .map((s) => ({ saborId: s.id, cantidad: cant[s.id] }));
      const r = await registrarVentaDirecta({
        items,
        clienteId: clienteId || null,
        conFactura,
        nota: nota || null,
      });
      setMsg(r.ok ? { ok: true, text: r.message ?? "Listo" } : { ok: false, text: r.error });
      if (r.ok) {
        setCant({});
        setNota("");
        setClienteId("");
      }
    });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="grid gap-5"
    >
      {/* Destinatario / cobro */}
      <Field label="¿A quién se le vende?">
        <select
          value={clienteId}
          onChange={(e) => elegirDestino(e.target.value)}
          className={inputClass}
        >
          <option value="">Mostrador — cobro al instante (contado)</option>
          {cuentas.length > 0 && (
            <optgroup label="A cuenta de proveedor (queda como deuda)">
              {cuentas.map((c) => (
                <option key={c.clienteId} value={c.clienteId}>
                  {c.nombre}
                  {c.nit ? " (con NIT)" : " (sin NIT)"}
                </option>
              ))}
            </optgroup>
          )}
        </select>
      </Field>

      {clienteId && (
        <p className="-mt-2 rounded-xl bg-[var(--color-rojo)]/[0.06] px-3 py-2 text-body-sm text-[var(--color-gris-500)]">
          Esta venta se carga como <strong>deuda</strong> en la cuenta de{" "}
          <strong>{cuentaSel?.nombre}</strong>. La cobrás después desde{" "}
          <em>Cuentas</em>. El stock se descuenta ahora.
        </p>
      )}

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
                  {formatBs(precioUnit(s))} c/u
                  {esProveedor && (
                    <span className="ml-1 text-[var(--color-rojo)]">· proveedor</span>
                  )}
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

      {/* Con / sin factura — aplica a toda venta (define el precio y el QR). */}
      <div className="grid gap-2 rounded-2xl border border-[var(--color-rojo)]/20 bg-[var(--color-rojo)]/[0.04] p-4">
        <p className="text-body-sm font-medium">
          {esProveedor
            ? `Precio proveedor (desde ${UMBRAL_PROVEEDOR} bolsas)`
            : "Precio normal"}
        </p>
        <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setConFactura(false)}
              aria-pressed={!conFactura}
              className={`rounded-xl px-3 py-2.5 text-body-sm font-semibold transition-colors ${
                !conFactura
                  ? "bg-[var(--color-negro)] text-[var(--color-crema)]"
                  : "border border-[var(--color-negro)]/15 bg-white text-[var(--color-gris-500)]"
              }`}
            >
              Sin factura
            </button>
            <button
              type="button"
              onClick={() => setConFactura(true)}
              aria-pressed={conFactura}
              className={`rounded-xl px-3 py-2.5 text-body-sm font-semibold transition-colors ${
                conFactura
                  ? "bg-[var(--color-negro)] text-[var(--color-crema)]"
                  : "border border-[var(--color-negro)]/15 bg-white text-[var(--color-gris-500)]"
              }`}
            >
              Con factura
            </button>
        </div>
      </div>

      <Field label="Nota (opcional) — ej. quién se lo llevó">
        <input
          type="text"
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          className={inputClass}
          placeholder="Ej. Juan (trabajador)"
        />
      </Field>

      {totalBolsas > 0 && (
        <div className="grid gap-1 rounded-2xl border border-[var(--color-negro)]/10 bg-white px-4 py-3">
          {sabores
            .filter((s) => (cant[s.id] ?? 0) > 0)
            .map((s) => {
              const n = cant[s.id] ?? 0;
              return (
                <div
                  key={s.id}
                  className="flex items-baseline justify-between gap-3 text-body-sm text-[var(--color-gris-500)]"
                >
                  <span>
                    <span className="font-semibold text-[var(--color-negro)]">{n}</span> × {s.nombre}{" "}
                    · {formatBs(precioUnit(s))} c/u
                  </span>
                  <span className="tabular-nums">{formatBs(n * precioUnit(s))}</span>
                </div>
              );
            })}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[var(--color-negro)]/[0.03] px-4 py-3">
        <span className="text-body-sm text-[var(--color-gris-500)]">
          {totalBolsas} {totalBolsas === 1 ? "bolsa" : "bolsas"}
          {clienteId ? " · a cuenta" : ""}
        </span>
        <span className="font-display text-3xl leading-none">{formatBs(total)}</span>
      </div>

      <div>
        <button
          type="submit"
          disabled={pending || totalBolsas === 0}
          className="inline-flex w-full items-center justify-center rounded-full bg-[var(--color-rojo)] px-6 py-3.5 text-base font-bold text-[var(--color-crema)] transition-all hover:bg-[var(--color-rojo-oscuro)] disabled:opacity-50 sm:w-auto"
        >
          {pending
            ? "Registrando…"
            : clienteId
              ? "Cargar a la cuenta"
              : "Registrar venta"}
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
