"use client";

import { useState, useTransition } from "react";
import { CheckCircle2 } from "lucide-react";
import { resolverAtencion } from "@/lib/admin/actions";
import { formatFechaHora } from "@/lib/admin/format";
import { Badge, EmptyState } from "@/components/admin/ui";
import type { AtencionRow } from "@/lib/admin/types";

const MOTIVO: Record<string, { label: string; tone: "warn" | "danger" | "info" }> = {
  proveedor: { label: "Proveedor", tone: "info" },
  empresa: { label: "Empresa / consignación", tone: "info" },
  reclamo: { label: "Reclamo / problema", tone: "danger" },
  dueno: { label: "Quiere hablar con el dueño", tone: "warn" },
  otro: { label: "Otro", tone: "warn" },
};

export function AtencionClient({ items }: { items: AtencionRow[] }) {
  const [list, setList] = useState(items);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, start] = useTransition();

  if (list.length === 0) {
    return (
      <EmptyState>
        No hay nadie esperando atención. El bot está atendiendo a todos. 🎉
      </EmptyState>
    );
  }

  const resolver = (id: string) => {
    setBusyId(id);
    start(async () => {
      setError(null);
      const r = await resolverAtencion(id);
      if (r.ok) setList((l) => l.filter((x) => x.id !== id));
      else setError(r.error);
      setBusyId(null);
    });
  };

  return (
    <div className="space-y-3">
      {error && <p className="text-body-sm text-[var(--color-rojo)]">{error}</p>}
      {list.map((a) => {
        const m = MOTIVO[a.motivo] ?? { label: a.motivo, tone: "warn" as const };
        return (
          <div
            key={a.id}
            className="rounded-2xl border border-[var(--color-rojo)]/20 bg-white p-4 sm:p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-body-md font-semibold">
                    {a.nombre || "Cliente"}
                  </span>
                  <Badge tone={m.tone}>{m.label}</Badge>
                </div>
                <p className="mt-1 text-body-sm text-[var(--color-gris-500)]">
                  <a
                    href={`https://wa.me/${a.telefono}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[var(--color-negro)] underline decoration-[var(--color-negro)]/20 underline-offset-2"
                  >
                    {a.telefono}
                  </a>
                  {" · "}
                  {formatFechaHora(a.createdAt)}
                </p>
                {a.detalle && (
                  <p className="mt-2 text-body-sm text-[var(--color-negro)]">
                    “{a.detalle}”
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => resolver(a.id)}
                disabled={busyId === a.id}
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#16a34a] px-4 py-2.5 text-body-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                <CheckCircle2 className="size-4" strokeWidth={2.5} />
                {busyId === a.id ? "Reactivando…" : "Solucionado, activar bot"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
