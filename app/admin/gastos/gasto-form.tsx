"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { crearCategoriaGasto, registrarGasto } from "@/lib/admin/actions";
import { Field, inputClass } from "@/components/admin/ui";
import type { CategoriaGasto } from "@/lib/admin/types";

// Fecha local de hoy en formato YYYY-MM-DD (para el input date).
function hoyISO(): string {
  return new Date().toLocaleDateString("en-CA");
}

export function GastoForm({ categorias }: { categorias: CategoriaGasto[] }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [categoriaId, setCategoriaId] = useState(categorias[0]?.id ?? "");
  const [monto, setMonto] = useState("");
  const [fecha, setFecha] = useState(hoyISO());
  const [descripcion, setDescripcion] = useState("");
  const [nota, setNota] = useState("");

  const [nuevaCat, setNuevaCat] = useState("");
  const [creandoCat, setCreandoCat] = useState(false);

  const crearCat = () =>
    start(async () => {
      const r = await crearCategoriaGasto(nuevaCat);
      setMsg(r.ok ? { ok: true, text: "Categoría creada. Elegila en la lista." } : { ok: false, text: r.error });
      if (r.ok) {
        setNuevaCat("");
        setCreandoCat(false);
      }
    });

  const submit = () =>
    start(async () => {
      setMsg(null);
      const r = await registrarGasto({
        categoriaId,
        monto: Number(monto),
        fecha,
        descripcion: descripcion || null,
        nota: nota || null,
      });
      setMsg(r.ok ? { ok: true, text: r.message ?? "Listo" } : { ok: false, text: r.error });
      if (r.ok) {
        setMonto("");
        setDescripcion("");
        setNota("");
        setFecha(hoyISO());
      }
    });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="grid gap-4 sm:grid-cols-2"
    >
      <Field label="Categoría">
        <div className="flex gap-2">
          <select
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            className={`${inputClass} flex-1`}
          >
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setCreandoCat((v) => !v)}
            aria-label="Nueva categoría"
            className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl border border-[var(--color-negro)]/15 transition-colors hover:bg-[var(--color-negro)]/5"
          >
            <Plus className="size-5" strokeWidth={2.5} />
          </button>
        </div>
      </Field>

      <Field label="Monto (Bs)">
        <input
          type="number"
          min={0}
          step="0.5"
          inputMode="decimal"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          required
          className={inputClass}
          placeholder="0"
        />
      </Field>

      {creandoCat && (
        <div className="sm:col-span-2 flex gap-2">
          <input
            type="text"
            value={nuevaCat}
            onChange={(e) => setNuevaCat(e.target.value)}
            className={`${inputClass} flex-1`}
            placeholder="Nueva categoría (ej. Mantenimiento)"
          />
          <button
            type="button"
            onClick={crearCat}
            disabled={pending || !nuevaCat.trim()}
            className="rounded-xl bg-[var(--color-negro)] px-4 py-2 text-body-sm font-semibold text-[var(--color-crema)] disabled:opacity-50"
          >
            Crear
          </button>
        </div>
      )}

      <Field label="Fecha">
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Descripción (opcional)">
        <input
          type="text"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className={inputClass}
          placeholder="Ej. 10 kg de pechuga"
        />
      </Field>

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={pending || !categoriaId || !(Number(monto) > 0)}
          className="inline-flex w-full items-center justify-center rounded-full bg-[var(--color-rojo)] px-6 py-3.5 text-base font-bold text-[var(--color-crema)] transition-all hover:bg-[var(--color-rojo-oscuro)] disabled:opacity-50 sm:w-auto"
        >
          {pending ? "Guardando…" : "Registrar gasto"}
        </button>
        {msg && (
          <p className={`mt-3 text-body-sm ${msg.ok ? "text-[#16a34a]" : "text-[var(--color-rojo)]"}`}>
            {msg.text}
          </p>
        )}
      </div>
    </form>
  );
}
