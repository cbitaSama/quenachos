import { getDashboard } from "@/lib/admin/queries";
import { formatBs } from "@/lib/admin/format";
import { KpiCard, Card, EmptyState, Badge } from "@/components/admin/ui";
import { ProduccionChart } from "./dashboard-charts";
import { AlertasVencimiento } from "./alertas-vencimiento";
import { ConfirmarButton } from "./pedidos/confirmar-button";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const d = await getDashboard();

  return (
    <div className="space-y-7">
      <header>
        <h1 className="font-display text-display-md uppercase leading-none">
          Resumen de hoy
        </h1>
        <p className="mt-1 text-body-sm capitalize text-[var(--color-gris-500)]">
          {d.fechaLegible} · Santa Cruz
        </p>
      </header>

      {!d.configured && (
        <div className="rounded-2xl border border-[#f59e0b]/40 bg-[#fffbeb] px-4 py-3 text-body-sm text-[#b45309]">
          Falta conectar la base: agregá <code>SUPABASE_DB_URL</code> en{" "}
          <code>.env.local</code> para ver datos reales.
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard label="Ventas del día" value={formatBs(d.ventasBs)} tone="ok" hint={`${d.ventasPedidos} pedidos`} />
        <KpiCard label="Unidades vendidas" value={d.unidadesVendidas} tone="ok" />
        <KpiCard label="Producido hoy" value={d.producidoHoy} tone="info" hint="bolsas" />
        <KpiCard
          label="Por confirmar"
          value={d.pedidosPorConfirmar.length}
          tone={d.pedidosPorConfirmar.length > 0 ? "warn" : "neutral"}
        />
      </div>

      <AlertasVencimiento lotes={d.lotesAlerta} />

      <ProduccionChart porSabor={d.porSabor} />

      {/* Stock vs mínimo */}
      <Card title="Stock por sabor">
        {d.stock.length === 0 ? (
          <p className="text-body-sm text-[var(--color-gris-500)]">Sin datos.</p>
        ) : (
          <ul className="divide-y divide-[var(--color-negro)]/5">
            {d.stock.map((s) => (
              <li key={s.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                <span className="text-body-md">{s.nombre}</span>
                <span className="flex items-center gap-2">
                  <span className="text-body-md tabular-nums">{s.stockActual}</span>
                  <span className="text-body-sm text-[var(--color-gris-500)]">/ mín {s.stockMinimo}</span>
                  {s.bajoMinimo && <Badge tone="danger">bajo</Badge>}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Pedidos por confirmar */}
      <section>
        <h2 className="mb-3 text-caption text-[var(--color-gris-500)]">
          Pedidos por confirmar
        </h2>
        {d.pedidosPorConfirmar.length === 0 ? (
          <EmptyState>Nada pendiente. Todo al día. 🙌</EmptyState>
        ) : (
          <ul className="space-y-2">
            {d.pedidosPorConfirmar.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--color-negro)]/10 bg-white px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-body-md font-semibold">
                    {p.cliente ?? "Cliente web"}
                  </p>
                  <p className="text-body-sm text-[var(--color-gris-500)]">
                    {formatBs(p.totalBs)} ·{" "}
                    {p.items.map((it) => `${it.sabor} x${it.cantidad}`).join(", ") || "—"}
                  </p>
                </div>
                <ConfirmarButton pedidoId={p.id} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
