import {
  getCuentasPorCobrar,
  getSaboresVenta,
  getVentasFisicas,
} from "@/lib/admin/queries";
import { formatBs, formatFechaHora } from "@/lib/admin/format";
import { Card, EmptyState } from "@/components/admin/ui";
import type { CuentaVentaOption } from "@/lib/admin/types";
import { VentaFisicaForm } from "./venta-fisica-form";

export const dynamic = "force-dynamic";

export default async function VentaFisicaPage() {
  const [sabores, ventas, cuentas] = await Promise.all([
    getSaboresVenta(),
    getVentasFisicas(),
    getCuentasPorCobrar(),
  ]);

  const cuentaOptions: CuentaVentaOption[] = cuentas.map((c) => ({
    clienteId: c.clienteId,
    nombre: c.razonSocial || c.nombre || "Cuenta",
    nit: c.nit,
  }));

  return (
    <div className="space-y-7">
      <header>
        <h1 className="font-display text-display-md uppercase leading-none">
          Venta física
        </h1>
        <p className="mt-1 text-body-sm text-[var(--color-gris-500)]">
          Vendés en persona y se descuenta del stock al instante. Cobro al
          instante (mostrador) o a la cuenta de un proveedor (queda como deuda).
          Desde 25 bolsas se aplica precio proveedor.
        </p>
      </header>

      <Card title="Registrar venta">
        {sabores.length === 0 ? (
          <EmptyState>Conectá la base para registrar ventas.</EmptyState>
        ) : (
          <VentaFisicaForm sabores={sabores} cuentas={cuentaOptions} />
        )}
      </Card>

      <section>
        <h2 className="mb-3 text-caption text-[var(--color-gris-500)]">
          Últimas ventas físicas
        </h2>
        {ventas.length === 0 ? (
          <EmptyState>Todavía no registraste ventas físicas.</EmptyState>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[var(--color-negro)]/10 bg-white">
            <table className="w-full text-left text-body-sm">
              <thead className="border-b border-[var(--color-negro)]/10 text-caption text-[var(--color-gris-500)]">
                <tr>
                  <th className="px-4 py-2.5 font-normal">Fecha</th>
                  <th className="px-4 py-2.5 font-normal">Productos</th>
                  <th className="px-4 py-2.5 font-normal">Nota</th>
                  <th className="px-4 py-2.5 text-right font-normal">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-negro)]/5">
                {ventas.map((v) => (
                  <tr key={v.id}>
                    <td className="px-4 py-2.5 text-[var(--color-gris-500)]">
                      {formatFechaHora(v.createdAt)}
                    </td>
                    <td className="px-4 py-2.5">
                      {v.items
                        .map((it) => `${it.cantidad}× ${it.sabor}`)
                        .join(", ")}
                    </td>
                    <td className="px-4 py-2.5 text-[var(--color-gris-500)]">
                      {v.nota ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right font-semibold tabular-nums">
                      {formatBs(v.totalBs)}
                    </td>
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
