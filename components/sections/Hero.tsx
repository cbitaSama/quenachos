"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import type { Sabor } from "@/lib/types";
import { Grain } from "@/components/ui/Grain";
import { Logo } from "@/components/ui/Logo";
import { SocialIcons } from "@/components/ui/SocialIcons";
import { Button } from "@/components/ui/Button";
import { MENSAJES, whatsappLink } from "@/lib/whatsapp";
import { trackEvent } from "@/lib/analytics";

const ROTATE_MS = 5500;

type Props = { sabores: Sabor[] };

export function Hero({ sabores }: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);
  const shouldReduceMotion = useReducedMotion();
  const timerRef = useRef<number | null>(null);

  const active = sabores[index];

  const goTo = useCallback(
    (next: number) => {
      const len = sabores.length;
      const target = ((next % len) + len) % len;
      setDirection(target > index ? 1 : -1);
      setIndex(target);
    },
    [sabores.length, index],
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (paused || shouldReduceMotion) return;
    timerRef.current = window.setTimeout(() => {
      setDirection(1);
      setIndex((i) => (i + 1) % sabores.length);
    }, ROTATE_MS);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [index, paused, sabores.length, shouldReduceMotion]);

  const firstMount = useRef(true);
  useEffect(() => {
    if (firstMount.current) {
      firstMount.current = false;
      return;
    }
    trackEvent("sabor_view", { sabor: active.id });
  }, [active.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const nameNode =
    active.id === "limon-picante" ? (
      <>
        <span style={{ color: "#A3E635" }}>LIMÓN</span>{" "}
        <span style={{ color: "#FF1F1F" }}>PICANTE</span>
      </>
    ) : (
      <span>{active.nombre.toUpperCase()}</span>
    );

  return (
    <section
      aria-label="Sabores Que Nachos"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative isolate grid h-[100dvh] min-h-[640px] w-full grid-rows-[auto_1fr_auto] overflow-hidden"
      style={{ backgroundColor: active.colorFondo }}
    >
      {/* color crossfade layer */}
      <AnimatePresence mode="sync">
        <motion.div
          key={`bg-${active.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0 -z-10"
          style={{
            background: `radial-gradient(120% 90% at 50% 30%, ${shade(active.colorFondo, 18)} 0%, ${active.colorFondo} 55%, ${shade(active.colorFondo, -22)} 100%)`,
          }}
          aria-hidden="true"
        />
      </AnimatePresence>

      <Grain opacity={0.15} blendMode="overlay" />

      {/* progress bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex h-1 gap-1 px-4 pt-2 sm:px-8 sm:pt-3">
        {sabores.map((s, i) => (
          <div
            key={s.id}
            className="relative flex-1 overflow-hidden rounded-full bg-white/15"
          >
            <motion.div
              key={`prog-${active.id}-${i}`}
              initial={{ scaleX: i < index ? 1 : 0 }}
              animate={{ scaleX: i < index ? 1 : i === index ? 1 : 0 }}
              transition={{
                duration:
                  i === index && !paused && !shouldReduceMotion
                    ? ROTATE_MS / 1000
                    : 0.4,
                ease: "linear",
              }}
              style={{ originX: 0, backgroundColor: active.colorTexto }}
              className="h-full w-full"
            />
          </div>
        ))}
      </div>

      {/* ROW 1 — TOP BAR */}
      <header className="relative z-20 flex items-center justify-between px-4 pt-6 sm:px-8 sm:pt-8">
        <a href="#top" aria-label="Que Nachos" className="block">
          <Logo
            variant="crema"
            priority
            className="size-12 sm:size-14 lg:size-16"
          />
        </a>
        <SocialIcons tone="crema" />
      </header>

      {/* ROW 2 — MAIN (ghost + bolsa + decorativos) */}
      <div className="relative z-10 grid grid-rows-[auto_auto_1fr] overflow-hidden">
        {/* ghost text */}
        <div className="pointer-events-none relative z-10 flex justify-center pt-2 sm:pt-4">
          <AnimatePresence mode="wait">
            <motion.h1
              key={`name-${active.id}`}
              initial={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { y: 24 * direction, opacity: 0, filter: "blur(16px)" }
              }
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              exit={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { y: -24 * direction, opacity: 0, filter: "blur(10px)" }
              }
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              className="font-display text-center uppercase leading-[0.86] tracking-[-0.04em]"
              style={{
                color: active.colorTexto,
                fontSize: "clamp(60px, 14vw, 200px)",
              }}
            >
              {nameNode}
            </motion.h1>
          </AnimatePresence>
        </div>

        {/* subtitle */}
        <div className="relative z-10 flex justify-center px-4">
          <AnimatePresence mode="wait">
            <motion.p
              key={`sub-${active.id}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 0.85, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="font-script text-2xl sm:text-3xl lg:text-4xl"
              style={{ color: active.colorTexto }}
            >
              {active.subtitulo}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* bolsa + decorativos */}
        <div className="relative flex min-h-0 items-center justify-center">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={`bag-${active.id}`}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.x < -60) next();
                else if (info.offset.x > 60) prev();
              }}
              initial={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : {
                      opacity: 0,
                      x: 80 * direction,
                      scale: 0.9,
                      rotate: 4 * direction,
                      filter: "blur(8px)",
                    }
              }
              animate={{
                opacity: 1,
                x: 0,
                scale: 1,
                rotate: 0,
                filter: "blur(0px)",
              }}
              exit={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : {
                      opacity: 0,
                      x: -60 * direction,
                      scale: 0.92,
                      rotate: -4 * direction,
                      filter: "blur(8px)",
                    }
              }
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              whileHover={
                shouldReduceMotion ? undefined : { scale: 1.04, rotate: -1.5 }
              }
              className="relative z-10 cursor-grab touch-pan-y select-none active:cursor-grabbing"
            >
              <Image
                src={active.imagenBolsa}
                alt={`Bolsa Que Nachos sabor ${active.nombre}`}
                width={420}
                height={700}
                priority
                draggable={false}
                sizes="(max-width: 640px) 65vw, (max-width: 1024px) 42vw, 32vw"
                className="pointer-events-none mx-auto block h-auto w-[62vw] max-w-[300px] drop-shadow-[0_40px_80px_rgba(0,0,0,0.55)] sm:w-[42vw] sm:max-w-[380px] lg:w-[32vw] lg:max-w-[440px]"
              />
              <div
                aria-hidden="true"
                className="absolute -bottom-2 left-1/2 -z-10 h-12 w-[70%] -translate-x-1/2 rounded-[100%]"
                style={{
                  background: `radial-gradient(ellipse at center, ${active.colorTexto}55 0%, transparent 70%)`,
                  filter: "blur(18px)",
                }}
              />
            </motion.div>
          </AnimatePresence>

          {/* decorativo flotante derecho */}
          <AnimatePresence>
            <motion.div
              key={`deco-${active.id}`}
              initial={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, x: 120, rotate: -22, scale: 0.6 }
              }
              animate={{ opacity: 1, x: 0, rotate: 0, scale: 1 }}
              exit={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, x: -80, rotate: 22, scale: 0.7 }
              }
              transition={{
                duration: 0.75,
                ease: [0.4, 0, 0.2, 1],
                delay: 0.05,
              }}
              className="pointer-events-none absolute right-[4%] top-[6%] z-20 sm:right-[8%] sm:top-[4%]"
            >
              <motion.div
                animate={
                  shouldReduceMotion
                    ? undefined
                    : { y: [0, -10, 0], rotate: [0, 4, 0] }
                }
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Image
                  src={active.decorativo}
                  alt=""
                  width={260}
                  height={260}
                  aria-hidden="true"
                  sizes="(max-width: 640px) 28vw, 18vw"
                  style={{ width: "auto", height: "auto" }}
                  className="h-auto w-[28vw] max-w-[140px] drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)] sm:w-[18vw] sm:max-w-[200px]"
                />
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* decorativo flotante izquierdo */}
          <AnimatePresence>
            <motion.div
              key={`deco2-${active.id}`}
              initial={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, x: -140, rotate: 22, scale: 0.6 }
              }
              animate={{ opacity: 0.5, x: 0, rotate: -8, scale: 0.8 }}
              exit={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, x: 100, rotate: -22, scale: 0.7 }
              }
              transition={{
                duration: 0.75,
                ease: [0.4, 0, 0.2, 1],
                delay: 0.12,
              }}
              className="pointer-events-none absolute bottom-[6%] left-[2%] z-10 sm:bottom-[10%] sm:left-[6%]"
            >
              <motion.div
                animate={
                  shouldReduceMotion
                    ? undefined
                    : { y: [0, 8, 0], rotate: [-8, -4, -8] }
                }
                transition={{
                  duration: 6.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Image
                  src={active.decorativo}
                  alt=""
                  width={200}
                  height={200}
                  aria-hidden="true"
                  sizes="(max-width: 640px) 18vw, 12vw"
                  style={{ width: "auto", height: "auto" }}
                  className="h-auto w-[18vw] max-w-[90px] drop-shadow-[0_15px_30px_rgba(0,0,0,0.4)] sm:w-[12vw] sm:max-w-[130px]"
                />
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ROW 3 — BOTTOM (microcopy + CTA) */}
      <div className="relative z-20 px-4 pb-6 sm:px-8 sm:pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={`micro-${active.id}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="mx-auto mb-4 flex w-fit items-center gap-2 rounded-full px-4 py-1.5 backdrop-blur"
            style={{
              backgroundColor: `${active.colorTexto}18`,
              color: active.colorTexto,
              border: `1px solid ${active.colorTexto}3a`,
            }}
          >
            <Sparkles className="size-3.5" strokeWidth={2.5} />
            <span className="text-caption">
              {active.proteinaG}g proteína · sin culpa · horneados
            </span>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between gap-3 sm:gap-6">
          <button
            type="button"
            onClick={prev}
            aria-label="Sabor anterior"
            className="hidden size-12 items-center justify-center rounded-full border-2 transition-all hover:scale-110 sm:flex"
            style={{
              borderColor: `${active.colorTexto}66`,
              color: active.colorTexto,
            }}
          >
            <ChevronLeft strokeWidth={2.5} />
          </button>

          <Button
            href={whatsappLink(MENSAJES.porSabor(active.nombre))}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackEvent("whatsapp_click", {
                source: "hero",
                sabor: active.id,
              })
            }
            variant={active.id === "clasico" ? "secondary" : "primary"}
            size="xl"
            className="flex-1 sm:flex-initial sm:min-w-[280px]"
            fullWidth
          >
            PEDÍ {active.nombre.toUpperCase()}
          </Button>

          <button
            type="button"
            onClick={next}
            aria-label="Siguiente sabor"
            className="hidden size-12 items-center justify-center rounded-full border-2 transition-all hover:scale-110 sm:flex"
            style={{
              borderColor: `${active.colorTexto}66`,
              color: active.colorTexto,
            }}
          >
            <ChevronRight strokeWidth={2.5} />
          </button>
        </div>

        {/* dots */}
        <div className="mt-3 flex items-center justify-center gap-2">
          {sabores.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Ir al sabor ${s.nombre}`}
              className="transition-all"
              style={{
                width: i === index ? 24 : 7,
                height: 7,
                borderRadius: 4,
                backgroundColor:
                  i === index ? active.colorTexto : `${active.colorTexto}44`,
              }}
            />
          ))}
        </div>

        <p className="sr-only" aria-live="polite">
          Sabor activo: {active.nombre}
        </p>
      </div>
    </section>
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
