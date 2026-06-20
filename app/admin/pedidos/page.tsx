import { getPedidos } from "@/lib/admin/queries";
import { PedidosClient } from "./pedidos-client";

export const dynamic = "force-dynamic";

export default async function PedidosPage() {
  const pedidos = await getPedidos();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-display-md uppercase leading-none">
          Pedidos
        </h1>
        <p className="mt-1 text-body-sm text-[var(--color-gris-500)]">
          Confirmá el pago de un pedido para despacharlo. Eso descuenta del stock.
        </p>
      </header>

      <PedidosClient pedidos={pedidos} />
    </div>
  );
}
