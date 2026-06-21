import { getAtencion } from "@/lib/admin/queries";
import { getBotActivo } from "@/lib/n8n";
import { AtencionClient } from "./atencion-client";
import { BotControl } from "./bot-control";

export const dynamic = "force-dynamic";

export default async function AtencionPage() {
  const [items, botActivo] = await Promise.all([getAtencion(), getBotActivo()]);

  return (
    <div className="space-y-7">
      <header>
        <h1 className="font-display text-display-md uppercase leading-none">
          Bot y atención
        </h1>
        <p className="mt-1 text-body-sm text-[var(--color-gris-500)]">
          Encendé o apagá el bot, pausalo para un cliente puntual, y atendé a
          quienes tienen un problema o pidieron una persona. Mientras un cliente
          está pausado, el bot <strong>no le responde</strong> — lo atendés vos —
          hasta que toques “Solucionado, activar bot”.
        </p>
      </header>

      <BotControl activo={botActivo} />

      <section className="space-y-3">
        <h2 className="text-caption text-[var(--color-gris-500)]">
          Clientes pausados / esperando atención
        </h2>
        <AtencionClient items={items} />
      </section>
    </div>
  );
}
