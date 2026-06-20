import { getSaboresActivos, getMovimientos } from "@/lib/admin/queries";
import { Card, EmptyState } from "@/components/admin/ui";
import { ProduccionForm } from "./produccion-form";
import { ProduccionHistory } from "./produccion-history";

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
          Últimas producciones · editá o eliminá si te equivocaste
        </h2>
        <ProduccionHistory movimientos={movimientos} />
      </section>
    </div>
  );
}
