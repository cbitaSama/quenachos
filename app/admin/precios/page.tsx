import { getPrecios } from "@/lib/admin/queries";
import { Card, EmptyState } from "@/components/admin/ui";
import { PreciosForm } from "./precios-form";

export const dynamic = "force-dynamic";

export default async function PreciosPage() {
  const precios = await getPrecios();

  return (
    <div className="space-y-7">
      <header>
        <h1 className="font-display text-display-md uppercase leading-none">Precios</h1>
        <p className="mt-1 text-body-sm text-[var(--color-gris-500)]">
          Los 4 precios de cada sabor. El bot y la venta física los usan al instante.
          Con factura suele ser el precio de lista; sin factura, el que se cobra sin NIT.
        </p>
      </header>

      <Card title="Precios por sabor (Bs)">
        {precios.length === 0 ? (
          <EmptyState>Conectá la base para editar precios.</EmptyState>
        ) : (
          <PreciosForm precios={precios} />
        )}
      </Card>
    </div>
  );
}
