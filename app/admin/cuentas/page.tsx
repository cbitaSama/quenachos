import { getCuentasPorCobrar, getFacturas, getSilenciados } from "@/lib/admin/queries";
import { CuentasClient } from "./cuentas-client";

export const dynamic = "force-dynamic";

export default async function CuentasPage() {
  const [cuentas, facturas, silenciados] = await Promise.all([
    getCuentasPorCobrar(),
    getFacturas(),
    getSilenciados(),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-display-md uppercase leading-none">
          Cuentas por cobrar
        </h1>
        <p className="mt-1 text-body-sm text-[var(--color-gris-500)]">
          Clientes a crédito (colegios, proveedores). Cuando llega el corte,
          tocá <strong>Cobrar ahora</strong> y le mandamos el total + el QR. La
          deuda recién vuelve a 0 cuando confirmás el pago.
        </p>
      </header>

      <CuentasClient
        cuentas={cuentas}
        facturas={facturas}
        silenciados={silenciados.map((s) => s.telefono)}
      />
    </div>
  );
}
