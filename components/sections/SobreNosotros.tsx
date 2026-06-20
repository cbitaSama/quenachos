"use client";

import Image from "next/image";
import { motion } from "motion/react";

export function SobreNosotros() {
  return (
    <section
      id="sobre-nosotros"
      aria-labelledby="nosotros-title"
      className="relative bg-[var(--color-crema)] py-20 sm:py-28 lg:py-32"
    >
      <div className="container-q">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          {/* text */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-caption text-[var(--color-rojo)]">
              De dónde salimos
            </span>
            <h2
              id="nosotros-title"
              className="mt-4 font-display text-display-md uppercase leading-[1.0]"
            >
              No somos una marca
              <br />
              <span className="text-[var(--color-rojo)]">de comida fit</span>
              <br />
              que sabe a cartón.
            </h2>
            <div className="mt-6 space-y-5 text-body-lg text-[var(--color-gris-500)]">
              <p>
                Que Nachos nació de una idea simple:{" "}
                <strong className="text-[var(--color-negro)]">
                  ¿por qué tenemos que elegir entre comer rico y comer bien?
                </strong>
              </p>
              <p>
                Probamos, horneamos, ajustamos hasta que dio. Nachos crocantes,
                con sabor real, con la proteína que tu cuerpo necesita y sin las
                cosas que no.
              </p>
              <p>
                Somos nachos de verdad. De los que se nos antoja a nosotros
                mismos.
              </p>
            </div>

            <div className="mt-8 flex items-center gap-6">
              <div className="flex flex-col">
                <span className="font-display text-4xl text-[var(--color-rojo)]">
                  3
                </span>
                <span className="text-caption text-[var(--color-gris-500)]">
                  sabores
                </span>
              </div>
              <div className="h-12 w-px bg-[var(--color-negro)]/10" />
              <div className="flex flex-col">
                <span className="font-display text-4xl text-[var(--color-rojo)]">
                  100%
                </span>
                <span className="text-caption text-[var(--color-gris-500)]">
                  pollo
                </span>
              </div>
              <div className="h-12 w-px bg-[var(--color-negro)]/10" />
              <div className="flex flex-col">
                <span className="font-display text-4xl text-[var(--color-rojo)]">
                  0
                </span>
                <span className="text-caption text-[var(--color-gris-500)]">
                  culpa
                </span>
              </div>
            </div>
          </motion.div>

          {/* image collage */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
            className="relative mx-auto aspect-[4/5] w-full max-w-md"
          >
            {/* main image */}
            <div className="relative h-full w-full overflow-hidden rounded-[2.5rem] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.35)]">
              <Image
                src="/lifestyle/chica-bolsa.webp"
                alt="Persona disfrutando una bolsa de Que Nachos"
                fill
                sizes="(min-width: 1024px) 30vw, 90vw"
                className="object-cover"
              />
            </div>
            {/* sticker */}
            <div className="absolute -left-4 -top-4 rotate-[-6deg] rounded-2xl bg-[var(--color-rojo)] px-4 py-2 font-display text-xl text-[var(--color-crema)] shadow-[0_10px_25px_rgba(217,40,47,0.5)]">
              Hecho en Bolivia
            </div>
            {/* secondary sticker */}
            <div className="absolute -bottom-3 -right-3 rotate-[5deg] rounded-2xl bg-[var(--color-verde-lima)] px-4 py-2 font-display text-lg text-[var(--color-negro)] shadow-[0_10px_25px_rgba(163,230,53,0.4)]">
              100% Pollo
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
