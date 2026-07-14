import { MANUAL } from "@/lib/admin/manual";
import { AyudaClient } from "./ayuda-client";

export const dynamic = "force-dynamic";

export default function AyudaPage() {
  return (
    <div className="space-y-7">
      <header>
        <h1 className="font-display text-display-md uppercase leading-none">
          Ayuda
        </h1>
        <p className="mt-1 text-body-sm text-[var(--color-gris-500)]">
          Acá está explicado <strong>todo</strong> tu panel, sección por
          sección. Y si algo no te queda claro, preguntale directo a Nachito acá
          abajo — te guía paso a paso.
        </p>
      </header>

      <AyudaClient secciones={MANUAL} />
    </div>
  );
}
