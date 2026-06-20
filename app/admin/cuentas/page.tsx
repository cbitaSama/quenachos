import { getCuentasPorCobrar, getFacturas } from "@/lib/admin/queries";
import { CuentasClient } from "./cuentas-client";

export const dynamic = "force-dynamic";

export default async function CuentasPage() {
  const [cuentas, facturas] = await Promise.all([
    getCuentasPorCobrar(),
    getFacturas(),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-display-md uppercase leading-none">
          Cuentas por cobrar
        </h1>
        <p className="mt-1 text-body-sm text-[var(--color-gris-500)]">
          Clientes a crédito (colegios, proveedores). Cerrá el período y confirmá
          el pago — esto no toca el inventario.
        </p>
      </header>

      <CuentasClient cuentas={cuentas} facturas={facturas} />
    </div>
  );
}
