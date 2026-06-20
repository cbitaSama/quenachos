import { getSaboresActivos, getMovimientos } from "@/lib/admin/queries";
import { formatFecha, formatFechaHora } from "@/lib/admin/format";
import { Card, EmptyState } from "@/components/admin/ui";
import { ProduccionForm } from "./produccion-form";

export const dynamic = "force-dynamic";

export default async function ProduccionPage() {
  const [sabores, movimientos] = await Promise.all([
    getSaboresActivos(),
    getMovimientos("produccion"),
  ]);

  return (
    <div className="space-y-7">
      <header>
        <h1 className="font-display text-display-md uppercase leading-none">
          Producción
        </h1>
        <p className="mt-1 text-body-sm text-[var(--color-gris-500)]">
          Cargá lo que horneás. Sube el stock al instante.
        </p>
      </header>

      <Card title="Registrar producción">
        {sabores.length === 0 ? (
          <EmptyState>Conectá la base para cargar producción.</EmptyState>
        ) : (
          <ProduccionForm sabores={sabores} />
        )}
      </Card>

      <section>
        <h2 className="mb-3 text-caption text-[var(--color-gris-500)]">
          Últimas producciones
        </h2>
        {movimientos.length === 0 ? (
          <EmptyState>Todavía no registraste producción.</EmptyState>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[var(--color-negro)]/10 bg-white">
            <table className="w-full text-left text-body-sm">
              <thead className="border-b border-[var(--color-negro)]/10 text-caption text-[var(--color-gris-500)]">
                <tr>
                  <th className="px-4 py-2.5 font-normal">Fecha</th>
                  <th className="px-4 py-2.5 font-normal">Sabor</th>
                  <th className="px-4 py-2.5 text-right font-normal">Cantidad</th>
                  <th className="px-4 py-2.5 font-normal">Lote</th>
                  <th className="px-4 py-2.5 font-normal">Vence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-negro)]/5">
                {movimientos.map((m) => (
                  <tr key={m.id}>
                    <td className="px-4 py-2.5 text-[var(--color-gris-500)]">
                      {formatFechaHora(m.createdAt)}
                    </td>
                    <td className="px-4 py-2.5 font-medium">{m.sabor}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">+{m.cantidad}</td>
                    <td className="px-4 py-2.5">{m.lote ?? "—"}</td>
                    <td className="px-4 py-2.5">{formatFecha(m.vencimiento)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
