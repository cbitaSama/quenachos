import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { MARCA } from "@/lib/data/marca";

export const metadata = {
  title: "Política de Privacidad",
  description: `Política de privacidad de ${MARCA.nombre} (${MARCA.razonSocial}).`,
};

export default function PrivacidadPage() {
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
          Política de Privacidad
        </h1>
        <p className="mt-4 text-caption text-[var(--color-gris-500)]">
          Última actualización: mayo 2026
        </p>

        <div className="mt-10 space-y-5 text-body-lg text-[var(--color-gris-500)]">
          <p>
            Esta política describe cómo{" "}
            <strong className="text-[var(--color-negro)]">
              {MARCA.razonSocial}
            </strong>{" "}
            ({MARCA.nombre}) trata la información de los usuarios de este sitio
            web.
          </p>
          <p>
            Este sitio no recolecta datos personales más allá de cookies
            técnicas y métricas anónimas de Vercel Analytics. Los pedidos se
            coordinan directamente por WhatsApp, donde aplican las políticas
            propias de esa plataforma.
          </p>

          <p className="italic text-[var(--color-gris-500)]/80">
            [Placeholder legal — texto definitivo pendiente de asesoría legal en
            Bolivia. Si tenés dudas, escribinos por WhatsApp.]
          </p>
        </div>
      </article>
    </main>
  );
}
