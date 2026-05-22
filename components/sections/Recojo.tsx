"use client";

import { motion } from "motion/react";
import { Clock, MapPin, Navigation } from "lucide-react";
import type { Ubicacion } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { whatsappLink, MENSAJES } from "@/lib/whatsapp";
import { trackEvent } from "@/lib/analytics";

type Props = { ubicacion: Ubicacion };

export function Recojo({ ubicacion }: Props) {
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${ubicacion.coordenadas.lat},${ubicacion.coordenadas.lng}`;

  return (
    <section
      id="recojo"
      aria-labelledby="recojo-title"
      className="relative bg-[var(--color-crema)] py-20 sm:py-28 lg:py-32"
    >
      <div className="container-q">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* COL 1 — texto */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-caption text-[var(--color-rojo)]">
              Punto de recojo
            </span>
            <h2
              id="recojo-title"
              className="mt-4 font-display text-display-md uppercase"
            >
              Recogé tu pedido
              <br />
              <span className="text-[var(--color-rojo)]">en Santa Cruz</span>
            </h2>
            <p className="mt-5 text-body-lg text-[var(--color-gris-500)]">
              Hacés el pedido por WhatsApp y lo retirás en nuestro punto. Buscá el
              cartel que dice{" "}
              <strong className="font-semibold text-[var(--color-negro)]">
                NUTRAVIA SRL
              </strong>
              , ahí estamos.
            </p>

            <div className="mt-7 space-y-3">
              <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-[var(--color-negro)]/10" style={{ boxShadow: "0 4px 12px rgba(10,10,10,0.06)" }}>
                <div className="flex size-10 items-center justify-center rounded-xl bg-[var(--color-rojo)] text-[var(--color-crema)]">
                  <MapPin className="size-5" strokeWidth={2.25} />
                </div>
                <div>
                  <p className="text-body-sm font-semibold">
                    {ubicacion.landmark}
                  </p>
                  <p className="text-body-sm text-[var(--color-gris-500)]">
                    {ubicacion.ciudad}
                  </p>
                </div>
              </div>

              {ubicacion.horarios.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-[var(--color-negro)]/10"
                  style={{ boxShadow: "0 4px 12px rgba(10,10,10,0.06)" }}
                >
                  <div className="flex size-10 items-center justify-center rounded-xl bg-[var(--color-negro)] text-[var(--color-crema)]">
                    <Clock className="size-5" strokeWidth={2.25} />
                  </div>
                  <div>
                    <p className="text-body-sm font-semibold">{h.dias}</p>
                    <p className="text-body-sm text-[var(--color-gris-500)]">
                      {h.apertura} — {h.cierre}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                href={whatsappLink(MENSAJES.recojo)}
                target="_blank"
                rel="noopener noreferrer"
                variant="primary"
                size="lg"
                onClick={() =>
                  trackEvent("whatsapp_click", { source: "recojo" })
                }
              >
                Pedir por WhatsApp
              </Button>
              <Button
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="ghost"
                size="lg"
                icon={<Navigation className="size-4" strokeWidth={2.5} />}
                onClick={() => trackEvent("pickup_directions")}
              >
                Cómo llegar
              </Button>
            </div>
          </motion.div>

          {/* COL 2 — mapa */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-[2rem] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.25)] ring-1 ring-[var(--color-negro)]/10">
              <iframe
                src={ubicacion.googleMapsEmbedUrl}
                width="100%"
                height="480"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación de Que Nachos en Santa Cruz de la Sierra"
                className="block aspect-[4/5] sm:aspect-[4/3]"
              />
              {/* sticker overlay */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute right-4 top-4 rotate-[3deg] rounded-2xl bg-[var(--color-rojo)] px-3 py-2 text-[var(--color-crema)] shadow-[0_8px_20px_rgba(217,40,47,0.4)]"
              >
                <p className="font-display text-sm tracking-tight">¡Estamos acá!</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
