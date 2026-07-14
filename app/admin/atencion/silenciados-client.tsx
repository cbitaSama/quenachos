"use client";

import { useState, useTransition } from "react";
import { BellOff, Bell, Plus } from "lucide-react";
import { silenciarNumero, quitarSilencio } from "@/lib/admin/actions";
import { formatFechaHora } from "@/lib/admin/format";
import { EmptyState, inputClass } from "@/components/admin/ui";
import type { SilenciadoRow } from "@/lib/admin/types";

export function SilenciadosClient({ items }: { items: SilenciadoRow[] }) {
  const [list, setList] = useState(items);
  const [tel, setTel] = useState("");
  const [etiqueta, setEtiqueta] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [, start] = useTransition();

  const quitar = (row: SilenciadoRow) => {
    setBusyId(row.id);
    start(async () => {
      setMsg(null);
      const r = await quitarSilencio(row.telefono);
      if (r.ok) setList((l) => l.filter((x) => x.id !== row.id));
      else setMsg({ ok: false, text: r.error });
      setBusyId(null);
    });
  };

  return (
    <div className="space-y-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            setMsg(null);
            const r = await silenciarNumero({ telefono: tel, etiqueta });
            if (r.ok) {
              setList((l) => [
                {
                  id: `tmp-${tel.replace(/\D/g, "")}`,
                  telefono: tel.replace(/\D/g, ""),
                  etiqueta: etiqueta || null,
                  nota: null,
                  createdAt: new Date().toISOString(),
                },
                ...l.filter((x) => x.telefono !== tel.replace(/\D/g, "")),
              ]);
              setTel("");
              setEtiqueta("");
            }
            setMsg(r.ok ? { ok: true, text: r.message ?? "Listo" } : { ok: false, text: r.error });
          });
        }}
        className="flex flex-col gap-2 sm:flex-row"
      >
        <input
          className={`${inputClass} sm:flex-1`}
          value={tel}
          onChange={(e) => setTel(e.target.value)}
          placeholder="Número (591...)"
        />
        <input
          className={`${inputClass} sm:flex-1`}
          value={etiqueta}
          onChange={(e) => setEtiqueta(e.target.value)}
          placeholder="Quién es (ej: Abogado)"
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[var(--color-negro)] px-4 py-2.5 text-body-sm font-bold text-[var(--color-crema)] disabled:opacity-60"
        >
          <Plus className="size-4" strokeWidth={2.5} /> Silenciar
        </button>
      </form>
      {msg && (
        <p className={`text-body-sm ${msg.ok ? "text-[#16a34a]" : "text-[var(--color-rojo)]"}`}>
          {msg.text}
        </p>
      )}

      {list.length === 0 ? (
        <EmptyState>
          Nadie silenciado. Agregá acá los números que el bot NO debe atender
          nunca (tu abogado, proveedores que manejás vos, familia).
        </EmptyState>
      ) : (
        <ul className="space-y-2">
          {list.map((s) => (
            <li
              key={s.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--color-negro)]/10 bg-white px-4 py-3"
            >
              <span className="flex min-w-0 items-center gap-2 text-body-sm">
                <BellOff className="size-4 shrink-0 text-[var(--color-gris-500)]" strokeWidth={2.25} />
                <span className="truncate">
                  <span className="font-semibold">{s.etiqueta || "Sin etiqueta"}</span>{" "}
                  <span className="text-[var(--color-gris-500)]">
                    · {s.telefono} · desde {formatFechaHora(s.createdAt)}
                  </span>
                </span>
              </span>
              <button
                type="button"
                onClick={() => quitar(s)}
                disabled={busyId === s.id}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--color-negro)]/15 px-3 py-1.5 text-body-sm font-semibold hover:bg-[var(--color-negro)]/[0.04] disabled:opacity-50"
              >
                <Bell className="size-4" strokeWidth={2.25} />
                {busyId === s.id ? "…" : "Volver a atender"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
