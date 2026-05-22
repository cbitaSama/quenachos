import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { MARCA } from "@/lib/data/marca";

export const metadata = {
  title: "Términos y Condiciones",
  description: `Términos y condiciones de ${MARCA.nombre} (${MARCA.razonSocial}).`,
};

export default function TerminosPage() {
  return (
    <main className="bg-[var(--color-crema)]">
      <header className="container-q flex items-center justify-between py-8">
        <Link href="/" aria-label="Volver al inicio">
          <Logo variant="negro" className="size-12" />
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-body-sm font-semibold text-[var(--color-negro)] transition-colors hover:text-[var(--color-rojo)]"
        >
          <ArrowLeft className="size-4" strokeWidth={2.5} />
          Volver
        </Link>
      </header>

      <article className="container-q max-w-3xl pb-24">
        <h1 className="font-display text-display-md uppercase">
          Términos y Condiciones
        </h1>
        <p className="mt-4 text-caption text-[var(--color-gris-500)]">
          Última actualización: mayo 2026
        </p>

        <div className="mt-10 space-y-5 text-body-lg text-[var(--color-gris-500)]">
          <p>
            Estos términos regulan el uso del sitio web de{" "}
            <strong className="text-[var(--color-negro)]">
              {MARCA.razonSocial}
            </strong>{" "}
            ({MARCA.nombre}). Al utilizar el sitio aceptás los términos abajo
            descritos.
          </p>
          <p>
            El sitio actúa como una vitrina informativa de los productos.
            Los pedidos se gestionan por WhatsApp y el retiro se coordina
            directamente con el equipo en Santa Cruz de la Sierra.
          </p>

          <p className="italic text-[var(--color-gris-500)]/80">
            [Placeholder legal — texto definitivo pendiente de asesoría legal en
            Bolivia.]
          </p>
        </div>
      </article>
    </main>
  );
}
