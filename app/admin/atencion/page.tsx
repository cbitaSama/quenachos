import { getAtencion } from "@/lib/admin/queries";
import { AtencionClient } from "./atencion-client";

export const dynamic = "force-dynamic";

export default async function AtencionPage() {
  const items = await getAtencion();

  return (
    <div className="space-y-7">
      <header>
        <h1 className="font-display text-display-md uppercase leading-none">
          Atención
        </h1>
        <p className="mt-1 text-body-sm text-[var(--color-gris-500)]">
          Clientes con un problema o que pidieron una persona. Mientras están
          acá, el bot <strong>no les responde</strong> — los atendés vos. Cuando
          lo resolvés, tocás “Solucionado” y el bot vuelve a atenderlos.
        </p>
      </header>

      <AtencionClient items={items} />
    </div>
  );
}
