"use client";

import { useState, useTransition } from "react";
import { registrarProduccion } from "@/lib/admin/actions";
import { Field, inputClass } from "@/components/admin/ui";

export function ProduccionForm({
  sabores,
}: {
  sabores: { id: string; nombre: string }[];
}) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [saborId, setSaborId] = useState(sabores[0]?.id ?? "");
  const [cantidad, setCantidad] = useState("");
  const [lote, setLote] = useState("");
  const [venc, setVenc] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          setMsg(null);
          const r = await registrarProduccion({
            saborId,
            cantidad: Number(cantidad),
            lote: lote || null,
            vencimiento: venc || null,
          });
          setMsg(r.ok ? { ok: true, text: r.message ?? "Listo" } : { ok: false, text: r.error });
          if (r.ok) {
            setCantidad("");
            setLote("");
            setVenc("");
          }
        });
      }}
      className="grid gap-4 sm:grid-cols-2"
    >
      <Field label="Sabor">
        <select
          value={saborId}
          onChange={(e) => setSaborId(e.target.value)}
          className={inputClass}
        >
          {sabores.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nombre}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Cantidad (bolsas)">
        <input
          type="number"
          min={1}
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          required
          className={inputClass}
          placeholder="40"
        />
      </Field>

      <Field label="Lote (opcional)">
        <input
          type="text"
          value={lote}
          onChange={(e) => setLote(e.target.value)}
          className={inputClass}
          placeholder="Ej. PROD-06"
        />
      </Field>

      <Field label="Vencimiento (auto +90 días si lo dejás vacío)">
        <input
          type="date"
          value={venc}
          onChange={(e) => setVenc(e.target.value)}
          className={inputClass}
        />
      </Field>

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center rounded-full bg-[var(--color-rojo)] px-6 py-3 text-base font-bold text-[var(--color-crema)] transition-all hover:bg-[var(--color-rojo-oscuro)] disabled:opacity-60"
        >
          {pending ? "Registrando…" : "Registrar producción"}
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
