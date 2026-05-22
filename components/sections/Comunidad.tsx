"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import type { FotoLifestyle } from "@/lib/types";

type Props = { fotos: FotoLifestyle[] };

export function Comunidad({ fotos }: Props) {
  const shouldReduceMotion = useReducedMotion();
  const half = Math.ceil(fotos.length / 2);
  const row1 = fotos.slice(0, half);
  const row2 = fotos.slice(half).length >= 3 ? fotos.slice(half) : fotos.slice(0, half).reverse();

  return (
    <section
      id="comunidad"
      aria-labelledby="comunidad-title"
      className="relative overflow-hidden bg-[var(--color-crema)] py-20 sm:py-28 lg:py-32"
    >
      <div className="container-q">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="text-caption text-[var(--color-rojo)]">
            #TeamQueNachos
          </span>
          <h2
            id="comunidad-title"
            className="mt-4 font-display text-display-md uppercase"
          >
            Quienes ya son
            <br />
            <span className="text-[var(--color-rojo)]">del team</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-body-lg text-[var(--color-gris-500)]">
            Atletas, gym rats, oficinistas con hambre, parejas con película.
            Sumate.
          </p>
        </motion.div>
      </div>

      <div className="mt-14 space-y-5">
        <Row fotos={row1} direction="left" duration={shouldReduceMotion ? 0 : 50} />
        <Row fotos={row2} direction="right" duration={shouldReduceMotion ? 0 : 60} />
      </div>
    </section>
  );
}

function Row({
  fotos,
  direction,
  duration,
}: {
  fotos: FotoLifestyle[];
  direction: "left" | "right";
  duration: number;
}) {
  const doubled = [...fotos, ...fotos, ...fotos];
  return (
    <div className="marquee-mask overflow-hidden">
      <motion.div
        className="flex gap-4"
        animate={
          duration === 0
            ? undefined
            : {
                x: direction === "left" ? ["0%", "-33.3333%"] : ["-33.3333%", "0%"],
              }
        }
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear",
        }}
        whileHover={{ animationPlayState: "paused" }}
      >
        {doubled.map((foto, i) => (
          <div
            key={`${foto.id}-${i}`}
            className="relative aspect-[4/5] w-[200px] flex-shrink-0 overflow-hidden rounded-[1.5rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.25)] ring-1 ring-[var(--color-negro)]/10 sm:w-[240px] md:w-[280px]"
          >
            <Image
              src={foto.src}
              alt={foto.alt}
              fill
              sizes="(min-width: 768px) 280px, 200px"
              className="object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
