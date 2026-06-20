"use client";

import { useState, useTransition } from "react";
import type { CuentaCorriente, FacturaAdmin } from "@/lib/admin/types";
import { formatBs, formatFecha } from "@/lib/admin/format";
import { cerrarFactura, pagarFactura } from "@/lib/admin/actions";
import { Badge, Card, EmptyState, Field, inputClass } from "@/components/admin/ui";

export function CuentasClient({
  cuentas,
  facturas,
}: {
  cuentas: CuentaCorriente[];
  facturas: FacturaAdmin[];
}) {
  const total = cuentas.reduce((s, c) => s + c.saldoPendienteBs, 0);

  return (
    <div className="space-y-7">
      <Card title="Total por cobrar">
        <p className="font-display text-display-md leading-none text-[var(--color-rojo)]">
          {formatBs(total)}
        </p>
      </Card>

      <section className="space-y-3">
        <h2 className="text-caption text-[var(--color-gris-500)]">
          Clientes con cuenta corriente
        </h2>
        {cuentas.length === 0 ? (
          <EmptyState>
            Sin clientes institucionales todavía. Se cargan cuando un colegio /
            proveedor pide a crédito.
          </EmptyState>
        ) : (
          cuentas.map((c) => <CuentaCard key={c.clienteId} cuenta={c} />)
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-caption text-[var(--color-gris-500)]">Facturas</h2>
        {facturas.length === 0 ? (
          <EmptyState>Sin facturas emitidas.</EmptyState>
        ) : (
          <ul className="space-y-2">
            {facturas.map((f) => (
              <FacturaRow key={f.id} factura={f} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function CuentaCard({ cuenta }: { cuenta: CuentaCorriente }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [inicio, setInicio] = useState("");
  const [fin, setFin] = useState("");
  const [fechaPago, setFechaPago] = useState("");

  return (
    <div className="rounded-2xl border border-[var(--color-negro)]/10 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-body-md font-semibold">
            {cuenta.razonSocial ?? cuenta.nombre ?? "Cliente"}
          </p>
          <p className="text-body-sm text-[var(--color-gris-500)]">
            Ciclo {cuenta.ciclo} · corte día {cuenta.diaCorte}
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-2xl leading-none">
            {formatBs(cuenta.saldoPendienteBs)}
          </p>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="mt-1 text-body-sm font-semibold text-[var(--color-rojo)] hover:underline"
          >
            {open ? "Cerrar" : "Cerrar período →"}
          </button>
        </div>
      </div>

      {open && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            start(async () => {
              setMsg(null);
              const r = await cerrarFactura({
                clienteId: cuenta.clienteId,
                inicio,
                fin,
                fechaPago: fechaPago || null,
              });
              setMsg(r.ok ? { ok: true, text: r.message ?? "Listo" } : { ok: false, text: r.error });
            });
          }}
          className="mt-4 grid gap-3 border-t border-[var(--color-negro)]/10 pt-4 sm:grid-cols-3"
        >
          <Field label="Desde">
            <input type="date" required value={inicio} onChange={(e) => setInicio(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Hasta">
            <input type="date" required value={fin} onChange={(e) => setFin(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Pago límite">
            <input type="date" value={fechaPago} onChange={(e) => setFechaPago(e.target.value)} className={inputClass} />
          </Field>
          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={pending}
              className="rounded-full bg-[var(--color-negro)] px-5 py-2.5 text-body-sm font-bold text-[var(--color-crema)] disabled:opacity-60"
            >
              {pending ? "Cerrando…" : "Generar factura del período"}
            </button>
            {msg && (
              <span className={`ml-3 text-body-sm ${msg.ok ? "text-[#16a34a]" : "text-[var(--color-rojo)]"}`}>
                {msg.text}
              </span>
            )}
          </div>
        </form>
      )}
    </div>
  );
}

function FacturaRow({ factura }: { factura: FacturaAdmin }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const pagada = factura.estado === "pagada";

  return (
    <li className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--color-negro)]/10 bg-white px-4 py-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate text-body-md font-semibold">{factura.cliente ?? "Cliente"}</p>
          <Badge tone={pagada ? "ok" : factura.estado === "enviada" ? "info" : "warn"}>
            {factura.estado}
          </Badge>
        </div>
        <p className="text-body-sm text-[var(--color-gris-500)]">
          {formatBs(factura.totalBs)} · {formatFecha(factura.periodoInicio)} a{" "}
          {formatFecha(factura.periodoFin)}
          {factura.fechaPagoLimite ? ` · paga ${formatFecha(factura.fechaPagoLimite)}` : ""}
        </p>
      </div>
      {!pagada && (
        <div className="flex flex-col items-end gap-1">
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              start(async () => {
                setError(null);
                const r = await pagarFactura({ facturaId: factura.id });
                if (!r.ok) setError(r.error);
              })
            }
            className="rounded-full bg-[#16a34a] px-4 py-2 text-body-sm font-bold text-white disabled:opacity-60"
          >
            {pending ? "…" : "Marcar pagada"}
          </button>
          {error && <span className="text-[11px] text-[var(--color-rojo)]">{error}</span>}
        </div>
      )}
    </li>
  );
}
