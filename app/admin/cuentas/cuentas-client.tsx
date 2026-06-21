"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Phone, MapPin } from "lucide-react";
import type { CuentaCorriente, FacturaAdmin } from "@/lib/admin/types";
import { formatBs, formatFecha } from "@/lib/admin/format";
import {
  agregarContacto,
  cerrarFactura,
  crearCuenta,
  pagarFactura,
  quitarContacto,
  setDireccionCuenta,
} from "@/lib/admin/actions";
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
      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-stretch">
        <Card title="Total por cobrar">
          <p className="font-display text-display-md leading-none text-[var(--color-rojo)]">
            {formatBs(total)}
          </p>
        </Card>
      </div>

      <NuevaCuentaForm />

      <section className="space-y-3">
        <h2 className="text-caption text-[var(--color-gris-500)]">
          Cuentas corrientes (proveedores / clientes a crédito)
        </h2>
        {cuentas.length === 0 ? (
          <EmptyState>
            Sin cuentas todavía. Creá una arriba para habilitar pedidos a crédito.
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

function Msg({ msg }: { msg: { ok: boolean; text: string } | null }) {
  if (!msg) return null;
  return (
    <span className={`text-body-sm ${msg.ok ? "text-[#16a34a]" : "text-[var(--color-rojo)]"}`}>
      {msg.text}
    </span>
  );
}

function NuevaCuentaForm() {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [f, setF] = useState({
    razonSocial: "",
    contacto: "",
    telefono: "",
    ciclo: "mensual",
    diaCorte: "1",
    direccion: "",
    nit: "",
  });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  return (
    <Card title="Nueva cuenta corriente">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-negro)] px-4 py-2.5 text-body-sm font-bold text-[var(--color-crema)]"
        >
          <Plus className="size-4" strokeWidth={2.5} /> Agregar cuenta
        </button>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            start(async () => {
              setMsg(null);
              const r = await crearCuenta({
                razonSocial: f.razonSocial,
                contacto: f.contacto,
                telefono: f.telefono,
                ciclo: f.ciclo,
                diaCorte: Number(f.diaCorte) || 1,
                direccion: f.direccion,
                nit: f.nit,
              });
              setMsg(r.ok ? { ok: true, text: r.message ?? "Listo" } : { ok: false, text: r.error });
              if (r.ok) {
                setF({ razonSocial: "", contacto: "", telefono: "", ciclo: "mensual", diaCorte: "1", direccion: "", nit: "" });
                setOpen(false);
              }
            });
          }}
          className="grid gap-3 sm:grid-cols-2"
        >
          <Field label="Razón social / nombre">
            <input className={inputClass} value={f.razonSocial} onChange={set("razonSocial")} placeholder="Colegio San Andrés" />
          </Field>
          <Field label="Contacto">
            <input className={inputClass} value={f.contacto} onChange={set("contacto")} placeholder="María (compras)" />
          </Field>
          <Field label="Teléfono (queda autorizado)">
            <input className={inputClass} value={f.telefono} onChange={set("telefono")} placeholder="591..." />
          </Field>
          <Field label="Ciclo de cobro">
            <select className={inputClass} value={f.ciclo} onChange={set("ciclo")}>
              <option value="mensual">Mensual</option>
              <option value="trimestral">Trimestral</option>
            </select>
          </Field>
          <Field label="Día de corte">
            <input type="number" min={1} max={28} className={inputClass} value={f.diaCorte} onChange={set("diaCorte")} />
          </Field>
          <Field label="Dirección de entrega (siempre la misma)">
            <input className={inputClass} value={f.direccion} onChange={set("direccion")} placeholder="5to anillo, av..." />
          </Field>
          <Field label="NIT (para factura — opcional)">
            <input className={inputClass} value={f.nit} onChange={set("nit")} placeholder="Ej. 1023456789" />
          </Field>
          <div className="flex items-center gap-3 sm:col-span-2">
            <button type="submit" disabled={pending} className="rounded-full bg-[var(--color-rojo)] px-5 py-2.5 text-body-sm font-bold text-[var(--color-crema)] disabled:opacity-60">
              {pending ? "Creando…" : "Crear cuenta"}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="text-body-sm text-[var(--color-gris-500)]">
              Cancelar
            </button>
            <Msg msg={msg} />
          </div>
        </form>
      )}
    </Card>
  );
}

function CuentaCard({ cuenta }: { cuenta: CuentaCorriente }) {
  return (
    <div className="space-y-4 rounded-2xl border border-[var(--color-negro)]/10 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-body-md font-semibold">
            {cuenta.razonSocial ?? cuenta.nombre ?? "Cliente"}
          </p>
          <p className="text-body-sm text-[var(--color-gris-500)]">
            Ciclo {cuenta.ciclo} · corte día {cuenta.diaCorte}
          </p>
        </div>
        <p className="shrink-0 font-display text-2xl leading-none">
          {formatBs(cuenta.saldoPendienteBs)}
        </p>
      </div>

      <DireccionEditor cuenta={cuenta} />
      <ContactosManager cuenta={cuenta} />
      <CerrarFacturaForm clienteId={cuenta.clienteId} />
    </div>
  );
}

function DireccionEditor({ cuenta }: { cuenta: CuentaCorriente }) {
  const [pending, start] = useTransition();
  const [dir, setDir] = useState(cuenta.direccionEntrega ?? "");
  const [gps, setGps] = useState(cuenta.gpsEntrega ?? "");
  const [nit, setNit] = useState(cuenta.nit ?? "");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  return (
    <div className="rounded-xl bg-[var(--color-negro)]/[0.03] p-3">
      <p className="mb-2 flex items-center gap-1.5 text-caption text-[var(--color-gris-500)]">
        <MapPin className="size-3.5" /> Entrega y NIT (el bot los usa sin re-preguntar)
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            setMsg(null);
            const r = await setDireccionCuenta({ clienteId: cuenta.clienteId, direccion: dir, gps, nit });
            setMsg(r.ok ? { ok: true, text: "Guardado" } : { ok: false, text: r.error });
          });
        }}
        className="flex flex-col gap-2"
      >
        <div className="flex flex-col gap-2 sm:flex-row">
          <input className={`${inputClass} flex-1`} value={dir} onChange={(e) => setDir(e.target.value)} placeholder="Dirección escrita" />
          <input className={`${inputClass} flex-1`} value={gps} onChange={(e) => setGps(e.target.value)} placeholder="Link GPS (Maps)" />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input className={`${inputClass} flex-1`} value={nit} onChange={(e) => setNit(e.target.value)} placeholder="NIT (para factura — vacío = sin factura)" />
          <button type="submit" disabled={pending} className="rounded-full bg-[var(--color-negro)] px-4 py-2.5 text-body-sm font-semibold text-[var(--color-crema)] disabled:opacity-60">
            {pending ? "…" : "Guardar"}
          </button>
        </div>
      </form>
      <Msg msg={msg} />
    </div>
  );
}

function ContactosManager({ cuenta }: { cuenta: CuentaCorriente }) {
  const [pending, start] = useTransition();
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="rounded-xl bg-[var(--color-negro)]/[0.03] p-3">
      <p className="mb-2 flex items-center gap-1.5 text-caption text-[var(--color-gris-500)]">
        <Phone className="size-3.5" /> Quién puede pedir a crédito ({cuenta.contactos.length})
      </p>

      {cuenta.contactos.length > 0 && (
        <ul className="mb-2 space-y-1.5">
          {cuenta.contactos.map((ct) => (
            <li key={ct.id} className="flex items-center justify-between rounded-lg bg-white px-3 py-2">
              <span className="text-body-sm">
                <span className="font-semibold">{ct.nombre}</span>{" "}
                <span className="text-[var(--color-gris-500)]">· {ct.telefono}</span>
              </span>
              <button
                type="button"
                aria-label={`Quitar ${ct.nombre}`}
                onClick={() => start(async () => { await quitarContacto(ct.id); })}
                className="text-[var(--color-gris-500)] hover:text-[var(--color-rojo)]"
              >
                <Trash2 className="size-4" strokeWidth={2.25} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            setError(null);
            const r = await agregarContacto({ clienteId: cuenta.clienteId, nombre, telefono });
            if (r.ok) { setNombre(""); setTelefono(""); }
            else setError(r.error);
          });
        }}
        className="flex flex-col gap-2 sm:flex-row"
      >
        <input className={`${inputClass} flex-1`} value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre" />
        <input className={`${inputClass} flex-1`} value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Teléfono (591...)" />
        <button type="submit" disabled={pending} className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[var(--color-rojo)] px-4 py-2.5 text-body-sm font-bold text-[var(--color-crema)] disabled:opacity-60">
          <Plus className="size-4" strokeWidth={2.5} /> Autorizar
        </button>
      </form>
      {error && <p className="mt-1.5 text-body-sm text-[var(--color-rojo)]">{error}</p>}
    </div>
  );
}

function CerrarFacturaForm({ clienteId }: { clienteId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [inicio, setInicio] = useState("");
  const [fin, setFin] = useState("");
  const [fechaPago, setFechaPago] = useState("");

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-body-sm font-semibold text-[var(--color-rojo)] hover:underline"
      >
        Cerrar período (generar cobro) →
      </button>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          setMsg(null);
          const r = await cerrarFactura({ clienteId, inicio, fin, fechaPago: fechaPago || null });
          setMsg(r.ok ? { ok: true, text: r.message ?? "Listo" } : { ok: false, text: r.error });
        });
      }}
      className="grid gap-3 border-t border-[var(--color-negro)]/10 pt-4 sm:grid-cols-3"
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
      <div className="flex items-center gap-3 sm:col-span-3">
        <button type="submit" disabled={pending} className="rounded-full bg-[var(--color-negro)] px-5 py-2.5 text-body-sm font-bold text-[var(--color-crema)] disabled:opacity-60">
          {pending ? "Cerrando…" : "Generar factura"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-body-sm text-[var(--color-gris-500)]">Cancelar</button>
        <Msg msg={msg} />
      </div>
    </form>
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
          {formatBs(factura.totalBs)} · {formatFecha(factura.periodoInicio)} a {formatFecha(factura.periodoFin)}
          {factura.fechaPagoLimite ? ` · paga ${formatFecha(factura.fechaPagoLimite)}` : ""}
        </p>
      </div>
      {!pagada && (
        <div className="flex flex-col items-end gap-1">
          <button
            type="button"
            disabled={pending}
            onClick={() => start(async () => {
              setError(null);
              const r = await pagarFactura({ facturaId: factura.id });
              if (!r.ok) setError(r.error);
            })}
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
