import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { SocialIcons } from "@/components/ui/SocialIcons";
import { whatsappLink, MENSAJES } from "@/lib/whatsapp";
import { MARCA } from "@/lib/data/marca";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden bg-[var(--color-negro)] text-[var(--color-crema)]">
      {/* ghost wordmark */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -bottom-12 text-center font-display text-[clamp(80px,18vw,260px)] uppercase leading-none tracking-[-0.05em] text-[var(--color-crema)]/4"
      >
        QUE NACHOS
      </div>

      <div className="container-q relative z-10 py-16 sm:py-20">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
          {/* col 1 */}
          <div>
            <Logo variant="crema" className="size-16 sm:size-20" />
            <p className="mt-5 max-w-sm text-body-md text-[var(--color-crema)]/70">
              {MARCA.tagline}. {MARCA.taglineSecundario}
            </p>
            <SocialIcons tone="crema" className="mt-6" />
          </div>

          {/* col 2 */}
          <div>
            <p className="text-caption text-[var(--color-crema)]/50">Navegación</p>
            <ul className="mt-4 space-y-2.5 text-body-md">
              <li>
                <a
                  href="#sabores"
                  className="transition-colors hover:text-[var(--color-rojo-neon)]"
                >
                  Sabores
                </a>
              </li>
              <li>
                <a
                  href="#recojo"
                  className="transition-colors hover:text-[var(--color-rojo-neon)]"
                >
                  Recojo
                </a>
              </li>
              <li>
                <a
                  href="#eventos"
                  className="transition-colors hover:text-[var(--color-rojo-neon)]"
                >
                  Eventos
                </a>
              </li>
              <li>
                <a
                  href={whatsappLink(MENSAJES.general)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-[var(--color-rojo-neon)]"
                >
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>

          {/* col 3 */}
          <div>
            <p className="text-caption text-[var(--color-crema)]/50">Contacto</p>
            <ul className="mt-4 space-y-2.5 text-body-md text-[var(--color-crema)]/80">
              <li>{MARCA.ciudad}</li>
              <li>{MARCA.pais}</li>
              <li>{MARCA.whatsappHorarios}</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start gap-4 border-t border-[var(--color-crema)]/10 pt-6 text-body-sm text-[var(--color-crema)]/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {MARCA.razonSocial}. Hecho con cariño en {MARCA.ciudad}.
          </p>
          <div className="flex items-center gap-5">
            <Link
              href="/privacidad"
              className="transition-colors hover:text-[var(--color-crema)]"
            >
              Privacidad
            </Link>
            <Link
              href="/terminos"
              className="transition-colors hover:text-[var(--color-crema)]"
            >
              Términos
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-body-sm text-[var(--color-crema)]/40">
          Creado por{" "}
          <a
            href="https://vectoria.space"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[var(--color-crema)]/70 underline-offset-4 transition-colors hover:text-[var(--color-rojo-neon)] hover:underline"
          >
            Vectoria.space
          </a>
        </p>
      </div>
    </footer>
  );
}
