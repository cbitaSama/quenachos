import { getInventario } from "@/lib/admin/queries";
import { estadoVencimiento, formatFecha } from "@/lib/admin/format";
import { Card, Badge, EmptyState } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function InventarioPage() {
  const { stock, lotes } = await getInventario();

  return (
    <div className="space-y-7">
      <header>
        <h1 className="font-display text-display-md uppercase leading-none">
          Inventario
        </h1>
        <p className="mt-1 text-body-sm text-[var(--color-gris-500)]">
          Stock actual y vencimiento de cada lote.
        </p>
      </header>

      <Card title="Stock por sabor">
        {stock.length === 0 ? (
          <EmptyState>Conectá la base para ver el inventario.</EmptyState>
        ) : (
          <ul className="divide-y divide-[var(--color-negro)]/5">
            {stock.map((s) => (
              <li key={s.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <span className="text-body-md font-medium">{s.nombre}</span>
                <span className="flex items-baseline gap-1.5">
                  <span className="font-display text-3xl leading-none">{s.stockActual}</span>
                  <span className="text-body-sm text-[var(--color-gris-500)]">bolsas</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <section>
        <h2 className="mb-3 text-caption text-[var(--color-gris-500)]">
          Lotes y vencimientos
        </h2>
        {lotes.length === 0 ? (
          <EmptyState>Sin lotes registrados.</EmptyState>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[var(--color-negro)]/10 bg-white">
            <table className="w-full text-left text-body-sm">
              <thead className="border-b border-[var(--color-negro)]/10 text-caption text-[var(--color-gris-500)]">
                <tr>
                  <th className="px-4 py-2.5 font-normal">Sabor</th>
                  <th className="px-4 py-2.5 font-normal">Lote</th>
                  <th className="px-4 py-2.5 text-right font-normal">Cantidad</th>
                  <th className="px-4 py-2.5 font-normal">Vence</th>
                  <th className="px-4 py-2.5 font-normal">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-negro)]/5">
                {lotes.map((l, i) => {
                  const { estado, dias } = estadoVencimiento(l.vencimiento);
                  return (
                    <tr key={`${l.saborId}-${l.lote}-${i}`}>
                      <td className="px-4 py-2.5 font-medium">{l.sabor}</td>
                      <td className="px-4 py-2.5">{l.lote ?? "—"}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{l.cantidad}</td>
                      <td className="px-4 py-2.5">{formatFecha(l.vencimiento)}</td>
                      <td className="px-4 py-2.5">
                        {estado === "vencido" ? (
                          <Badge tone="danger">vencido {Math.abs(dias)}d</Badge>
                        ) : estado === "pronto" ? (
                          <Badge tone="warn">en {dias}d</Badge>
                        ) : (
                          <span className="text-[var(--color-gris-500)]">ok</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
