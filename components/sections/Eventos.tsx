"use client";

import { motion } from "motion/react";
import { PartyPopper } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Grain } from "@/components/ui/Grain";
import { whatsappLink, MENSAJES } from "@/lib/whatsapp";
import { trackEvent } from "@/lib/analytics";

export function Eventos() {
  return (
    <section
      id="eventos"
      aria-labelledby="eventos-title"
      className="relative isolate overflow-hidden bg-[var(--color-negro)] py-24 sm:py-32 lg:py-40"
    >
      {/* event bg photo */}
      <Image
        src="/eventos/evento-cold-coffee-club.jpg"
        alt=""
        aria-hidden="true"
        fill
        priority={false}
        sizes="100vw"
        className="absolute inset-0 -z-30 object-cover object-center"
      />
      {/* dark gradient overlay for legibility */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0.75) 45%, rgba(10,10,10,0.92) 100%), radial-gradient(70% 50% at 85% 25%, rgba(241,28,31,0.45) 0%, transparent 65%)",
        }}
      />
      {/* spotlights */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-25"
        style={{
          backgroundImage:
            "conic-gradient(from 90deg at 30% 0%, transparent 0deg, rgba(255,255,255,0.18) 30deg, transparent 60deg), conic-gradient(from 270deg at 70% 0%, transparent 0deg, rgba(255,255,255,0.18) 30deg, transparent 60deg)",
        }}
      />
      <Grain opacity={0.14} blendMode="overlay" />

      {/* floating bag */}
      <motion.div
        aria-hidden="true"
        animate={{ y: [0, -12, 0], rotate: [-8, -4, -8] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -right-10 top-10 hidden lg:block"
      >
        <Image
          src="/sabores/bolsa-clasico.png"
          alt=""
          width={300}
          height={500}
          className="h-auto w-[240px] drop-shadow-[0_30px_60px_rgba(0,0,0,0.7)]"
        />
      </motion.div>

      <div className="container-q relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-3xl text-center text-[var(--color-crema)]"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-rojo)]/25 px-4 py-1.5 text-caption text-[var(--color-rojo-neon)] ring-1 ring-[var(--color-rojo)]/50 backdrop-blur">
            <PartyPopper className="size-3.5" strokeWidth={2.5} />
            Para eventos
          </span>
          <h2
            id="eventos-title"
            className="mt-6 font-display text-display-lg uppercase leading-[0.9] drop-shadow-[0_4px_30px_rgba(0,0,0,0.6)]"
          >
            ¿Tenés un{" "}
            <span className="text-[var(--color-rojo-neon)]">evento</span>?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-body-xl text-[var(--color-crema)]/90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]">
            Activaciones, carreras, cumples, fiestas, after-office, lanzamientos.
            Llevamos Que Nachos a donde lo necesites.
          </p>

          <div className="mt-10">
            <Button
              href={whatsappLink(MENSAJES.evento)}
              target="_blank"
              rel="noopener noreferrer"
              variant="primary"
              size="xl"
              onClick={() => {
                trackEvent("whatsapp_click", { source: "eventos" });
                trackEvent("event_inquiry");
              }}
            >
              Escribinos por WhatsApp
            </Button>
          </div>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-caption text-[var(--color-crema)]/60">
            <span>Night Fest</span>
            <span className="size-1 rounded-full bg-[var(--color-crema)]/30" />
            <span>Bad Sisters</span>
            <span className="size-1 rounded-full bg-[var(--color-crema)]/30" />
            <span>Cold Coffee Club</span>
            <span className="size-1 rounded-full bg-[var(--color-crema)]/30" />
            <span>Running Clubs</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
