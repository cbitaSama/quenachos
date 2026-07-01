"use client";

import { useState, useTransition } from "react";
import { crearEmpleado, pagarJornal, setEmpleadoActivo } from "@/lib/admin/actions";
import { formatBs } from "@/lib/admin/format";
import { Field, inputClass, Badge, EmptyState } from "@/components/admin/ui";
import type { EmpleadoRow } from "@/lib/admin/types";

function hoyISO(): string {
  return new Date().toLocaleDateString("en-CA");
}

export function EmpleadosPanel({ empleados }: { empleados: EmpleadoRow[] }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Alta de empleado
  const [nombre, setNombre] = useState("");
  const [pagoDia, setPagoDia] = useState("");

  // Pago de jornal en curso (por empleado)
  const [pagando, setPagando] = useState<string | null>(null);
  const [jornalMonto, setJornalMonto] = useState("");
  const [jornalFecha, setJornalFecha] = useState(hoyISO());

  const activos = empleados.filter((e) => e.activo);
  const inactivos = empleados.filter((e) => !e.activo);

  const alta = () =>
    start(async () => {
      setMsg(null);
      const r = await crearEmpleado({
        nombre,
        pagoDia: pagoDia ? Number(pagoDia) : null,
      });
      setMsg(r.ok ? { ok: true, text: r.message ?? "Listo" } : { ok: false, text: r.error });
      if (r.ok) {
        setNombre("");
        setPagoDia("");
      }
    });

  const abrirPago = (e: EmpleadoRow) => {
    setPagando(e.id);
    setJornalMonto(e.pagoDiaBs ? String(e.pagoDiaBs) : "");
    setJornalFecha(hoyISO());
    setMsg(null);
  };

  const confirmarPago = (e: EmpleadoRow) =>
    start(async () => {
      const r = await pagarJornal({
        empleadoId: e.id,
        fecha: jornalFecha,
        monto: jornalMonto ? Number(jornalMonto) : null,
      });
      setMsg(r.ok ? { ok: true, text: `Jornal de ${e.nombre} registrado.` } : { ok: false, text: r.error });
      if (r.ok) setPagando(null);
    });

  const toggle = (e: EmpleadoRow) =>
    start(async () => {
      const r = await setEmpleadoActivo({ id: e.id, activo: !e.activo });
      setMsg(r.ok ? { ok: true, text: r.message ?? "Listo" } : { ok: false, text: r.error });
    });

  return (
    <div className="grid gap-5">
      {/* Alta de empleado */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          alta();
        }}
        className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end"
      >
        <Field label="Nuevo empleado">
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className={inputClass}
            placeholder="Nombre"
          />
        </Field>
        <Field label="Pago por día (Bs)">
          <input
            type="number"
            min={0}
            step="0.5"
            inputMode="decimal"
            value={pagoDia}
            onChange={(e) => setPagoDia(e.target.value)}
            className={`${inputClass} sm:w-36`}
            placeholder="Opcional"
          />
        </Field>
        <button
          type="submit"
          disabled={pending || !nombre.trim()}
          className="inline-flex items-center justify-center rounded-full bg-[var(--color-negro)] px-5 py-3 text-body-sm font-bold text-[var(--color-crema)] transition-all hover:opacity-90 disabled:opacity-50"
        >
          Agregar
        </button>
      </form>

      {msg && (
        <p className={`text-body-sm ${msg.ok ? "text-[#16a34a]" : "text-[var(--color-rojo)]"}`}>
          {msg.text}
        </p>
      )}

      {/* Empleados activos */}
      {activos.length === 0 && inactivos.length === 0 ? (
        <EmptyState>Todavía no cargaste empleados.</EmptyState>
      ) : (
        <ul className="grid gap-2.5">
          {activos.map((e) => (
            <li
              key={e.id}
              className="rounded-2xl border border-[var(--color-negro)]/10 bg-white p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-body-md font-semibold">{e.nombre}</p>
                  <p className="text-body-sm text-[var(--color-gris-500)]">
                    {e.pagoDiaBs ? `${formatBs(e.pagoDiaBs)}/día · ` : ""}
                    este mes: {formatBs(e.pagadoMesBs)} ({e.diasMes} {e.diasMes === 1 ? "día" : "días"})
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => abrirPago(e)}
                    className="rounded-full bg-[var(--color-rojo)] px-4 py-2 text-body-sm font-bold text-[var(--color-crema)] transition-all hover:bg-[var(--color-rojo-oscuro)]"
                  >
                    Pagar jornal
                  </button>
                  <button
                    type="button"
                    onClick={() => toggle(e)}
                    disabled={pending}
                    className="rounded-full border border-[var(--color-negro)]/15 px-3 py-2 text-body-sm font-semibold text-[var(--color-gris-500)] transition-colors hover:bg-[var(--color-negro)]/5 disabled:opacity-50"
                  >
                    Desactivar
                  </button>
                </div>
              </div>

              {pagando === e.id && (
                <div className="mt-3 grid gap-2 rounded-xl bg-[var(--color-rojo)]/[0.04] p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                  <label className="flex flex-col gap-1">
                    <span className="text-body-sm text-[var(--color-gris-500)]">Monto (Bs)</span>
                    <input
                      type="number"
                      min={0}
                      step="0.5"
                      inputMode="decimal"
                      value={jornalMonto}
                      onChange={(ev) => setJornalMonto(ev.target.value)}
                      className={inputClass}
                      placeholder="Pago del día"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-body-sm text-[var(--color-gris-500)]">Fecha</span>
                    <input
                      type="date"
                      value={jornalFecha}
                      onChange={(ev) => setJornalFecha(ev.target.value)}
                      className={inputClass}
                    />
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => confirmarPago(e)}
                      disabled={pending || !(Number(jornalMonto) > 0)}
                      className="rounded-full bg-[var(--color-negro)] px-4 py-2.5 text-body-sm font-bold text-[var(--color-crema)] disabled:opacity-50"
                    >
                      {pending ? "…" : "Confirmar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPagando(null)}
                      className="rounded-full border border-[var(--color-negro)]/15 px-4 py-2.5 text-body-sm font-semibold text-[var(--color-gris-500)]"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}

          {inactivos.map((e) => (
            <li
              key={e.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--color-negro)]/10 bg-[var(--color-negro)]/[0.02] p-4"
            >
              <div>
                <p className="text-body-md font-semibold text-[var(--color-gris-500)]">
                  {e.nombre} <Badge>inactivo</Badge>
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggle(e)}
                disabled={pending}
                className="rounded-full border border-[var(--color-negro)]/15 px-3 py-2 text-body-sm font-semibold transition-colors hover:bg-[var(--color-negro)]/5 disabled:opacity-50"
              >
                Reactivar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
