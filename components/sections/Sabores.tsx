"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import Image from "next/image";
import { useRef, type MouseEvent } from "react";
import { ArrowRight } from "lucide-react";
import type { Sabor } from "@/lib/types";
import { whatsappLink, MENSAJES } from "@/lib/whatsapp";
import { trackEvent } from "@/lib/analytics";

type Props = { sabores: Sabor[] };

export function Sabores({ sabores }: Props) {
  return (
    <section
      id="sabores"
      aria-labelledby="sabores-title"
      className="relative bg-[var(--color-crema)] py-20 sm:py-28 lg:py-32"
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
            Los cuatro
          </span>
          <h2
            id="sabores-title"
            className="mt-4 font-display text-display-md uppercase"
          >
            Elegí el tuyo.
            <br />
            <span className="text-[var(--color-rojo)]">O llevátelos todos.</span>
          </h2>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {sabores.map((sabor, i) => (
            <SaborCard key={sabor.id} sabor={sabor} index={i} />
          ))}
        </div>

        {/* footer CTA: combo */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="mt-12 flex flex-col items-center gap-3 text-center"
        >
          <p className="text-body-md text-[var(--color-gris-500)]">
            ¿No sabés cuál? Probá los cuatro.
          </p>
          <a
            href={whatsappLink(MENSAJES.pack)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("whatsapp_click", { source: "sabores_combo" })}
            className="group inline-flex items-center gap-2 font-semibold text-[var(--color-rojo)] underline decoration-[var(--color-rojo)]/30 decoration-2 underline-offset-4 transition-colors hover:decoration-[var(--color-rojo)]"
          >
            Pedí el combo de los 4
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

function SaborCard({ sabor, index }: { sabor: Sabor; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [8, -8]);
  const rotateY = useTransform(x, [-100, 100], [-8, 8]);
  const shouldReduceMotion = useReducedMotion();

  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };
  const onMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const nameNode =
    sabor.id === "limon-picante" ? (
      <span className="block">
        <span style={{ color: "#A3E635" }}>LIMÓN</span>{" "}
        <span style={{ color: "#FF1F1F" }}>PICANTE</span>
      </span>
    ) : (
      <span style={{ color: sabor.colorTexto }}>{sabor.nombre.toUpperCase()}</span>
    );

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.55, delay: index * 0.08 }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        rotateX: shouldReduceMotion ? 0 : rotateX,
        rotateY: shouldReduceMotion ? 0 : rotateY,
        transformPerspective: 1200,
      }}
      className="group relative overflow-hidden rounded-[2rem]"
    >
      {/* color background */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: `linear-gradient(160deg, ${sabor.colorFondo} 0%, ${shade(sabor.colorFondo, -15)} 100%)`,
        }}
      />
      {/* big ghost name */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 font-display text-[clamp(60px,8vw,110px)] uppercase leading-none tracking-[-0.04em] opacity-15"
        style={{ color: sabor.colorTexto }}
      >
        {sabor.nombre.split(" ")[0].toUpperCase()}
      </span>

      <div className="relative flex h-full flex-col gap-5 p-6 sm:p-8">
        {/* bag */}
        <div className="relative mx-auto h-56 w-full sm:h-64">
          <Image
            src={sabor.imagenBolsa}
            alt={`Bolsa Que Nachos ${sabor.nombre}`}
            fill
            sizes="(min-width: 1024px) 22vw, (min-width: 640px) 44vw, 90vw"
            className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.45)] transition-transform duration-500 group-hover:scale-[1.04] group-hover:-rotate-1"
            draggable={false}
          />
          {/* floating decorativo */}
          <Image
            src={sabor.decorativo}
            alt=""
            aria-hidden="true"
            width={120}
            height={120}
            className="absolute -right-2 top-4 size-20 drop-shadow-[0_10px_20px_rgba(0,0,0,0.35)] transition-transform duration-500 group-hover:rotate-12"
          />
        </div>

        {/* text */}
        <div className="text-center">
          <p className="font-script text-2xl" style={{ color: sabor.colorAcento, opacity: 0.85 }}>
            {sabor.subtitulo}
          </p>
          <h3 className="mt-1 font-display text-[clamp(34px,4vw,52px)] leading-none">
            {nameNode}
          </h3>
          <p
            className="mt-3 text-body-sm leading-relaxed"
            style={{ color: `${sabor.colorTexto}cc` }}
          >
            {sabor.descripcionCorta}
          </p>
        </div>

        {/* footer row */}
        <div className="mt-auto flex items-center justify-between gap-3">
          <span
            className="inline-flex items-center rounded-full px-3 py-1.5 text-caption"
            style={{
              backgroundColor: `${sabor.colorTexto}1a`,
              color: sabor.colorTexto,
              border: `1px solid ${sabor.colorTexto}33`,
            }}
          >
            {sabor.proteinaG}g proteína
          </span>
          <a
            href={whatsappLink(MENSAJES.porSabor(sabor.nombre))}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackEvent("whatsapp_click", {
                source: "sabor_card",
                sabor: sabor.id,
              })
            }
            aria-label={`Pedir ${sabor.nombre} por WhatsApp`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold transition-transform hover:translate-x-1"
            style={{ color: sabor.colorTexto }}
          >
            Pedir
            <ArrowRight className="size-4" strokeWidth={2.5} />
          </a>
        </div>
      </div>
    </motion.div>
  );
}

function shade(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));
  const B = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));
  return `#${((R << 16) | (G << 8) | B).toString(16).padStart(6, "0")}`;
}
