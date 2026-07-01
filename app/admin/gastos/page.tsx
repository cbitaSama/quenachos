import { getCategoriasGasto, getEmpleados, getGastos } from "@/lib/admin/queries";
import { formatBs } from "@/lib/admin/format";
import { Card, EmptyState, KpiCard } from "@/components/admin/ui";
import { GastoForm } from "./gasto-form";
import { EmpleadosPanel } from "./empleados-panel";
import { GastosList } from "./gastos-list";

export const dynamic = "force-dynamic";

// Rango: primer día del mes actual (hora local Bolivia) hasta hoy.
function rangoMes(): { desde: string; hasta: string } {
  const now = new Date();
  const desde = new Date(now.getFullYear(), now.getMonth(), 1).toLocaleDateString("en-CA");
  const hasta = now.toLocaleDateString("en-CA");
  return { desde, hasta };
}

export default async function GastosPage() {
  const { desde, hasta } = rangoMes();
  const [categorias, empleados, gastos] = await Promise.all([
    getCategoriasGasto(),
    getEmpleados(),
    getGastos(desde, hasta),
  ]);

  const totalMes = gastos.reduce((s, g) => s + (g.montoBs ?? 0), 0);

  return (
    <div className="space-y-7">
      <header>
        <h1 className="font-display text-display-md uppercase leading-none">Gastos</h1>
        <p className="mt-1 text-body-sm text-[var(--color-gris-500)]">
          Cargá todo lo que gasta el negocio: insumos, servicios, alquiler, empleados.
          Se compara con los ingresos en <em>Finanzas</em>.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        <KpiCard label="Gastos del mes" value={formatBs(totalMes)} tone="danger" />
        <KpiCard label="Registros del mes" value={gastos.length} hint="gastos cargados" />
      </div>

      <Card title="Registrar gasto">
        {categorias.length === 0 ? (
          <EmptyState>Conectá la base para cargar gastos.</EmptyState>
        ) : (
          <GastoForm categorias={categorias} />
        )}
      </Card>

      <Card title="Empleados · pago por jornal">
        <EmpleadosPanel empleados={empleados} />
      </Card>

      <section>
        <h2 className="mb-3 text-caption text-[var(--color-gris-500)]">
          Gastos de este mes
        </h2>
        <GastosList gastos={gastos} />
      </section>
    </div>
  );
}
