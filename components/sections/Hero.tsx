"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
      className="relative isolate grid h-[calc(100svh+140px)] min-h-[780px] w-full grid-rows-[auto_1fr_auto_140px] overflow-hidden sm:h-[calc(100svh+150px)] sm:grid-rows-[auto_1fr_auto_150px] lg:h-[calc(100svh+160px)] lg:grid-rows-[auto_1fr_auto_160px]"
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
        {/* ghost text — z-20 so it sits ABOVE the bolsa when sizes overlap */}
        <div className="pointer-events-none relative z-20 flex justify-center pt-2 sm:pt-4">
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

        {/* subtitle — z-20 to keep above bolsa too */}
        <div className="relative z-20 flex justify-center px-4">
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

        {/* trío de bolsas — activa al centro, vecinas a los lados */}
        <div className="relative flex min-h-0 touch-pan-y items-center justify-center">
          {/* flechas translúcidas — señal de que se puede deslizar */}
          <button
            type="button"
            onClick={prev}
            aria-label="Sabor anterior"
            className="absolute left-1 top-1/2 z-30 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-white/10 backdrop-blur-md transition-all hover:scale-110 hover:bg-white/20 sm:left-3 sm:size-14"
            style={{ color: active.colorTexto }}
          >
            <ChevronLeft className="size-6 sm:size-7" strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Siguiente sabor"
            className="absolute right-1 top-1/2 z-30 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-white/10 backdrop-blur-md transition-all hover:scale-110 hover:bg-white/20 sm:right-3 sm:size-14"
            style={{ color: active.colorTexto }}
          >
            <ChevronRight className="size-6 sm:size-7" strokeWidth={2.5} />
          </button>

          {sabores.map((s, i) => {
            // offset normalizado a [-1, 0, 1] para 3 sabores
            let offset = i - index;
            const len = sabores.length;
            if (offset > len / 2) offset -= len;
            if (offset < -len / 2) offset += len;

            const isCenter = offset === 0;
            const pose = isCenter
              ? { x: "0%", scale: 1, rotate: 0, opacity: 1, blur: 0, z: 10 }
              : offset < 0
                ? { x: "-78%", scale: 0.58, rotate: -10, opacity: 0.5, blur: 3, z: 5 }
                : { x: "78%", scale: 0.58, rotate: 10, opacity: 0.5, blur: 3, z: 5 };

            const centerProps = isCenter
              ? {
                  drag: "x" as const,
                  dragConstraints: { left: 0, right: 0 },
                  dragElastic: 0.2,
                  onDragEnd: (
                    _e: unknown,
                    info: { offset: { x: number } },
                  ) => {
                    if (info.offset.x < -60) next();
                    else if (info.offset.x > 60) prev();
                  },
                  whileHover: shouldReduceMotion
                    ? undefined
                    : { scale: 1.04, rotate: -1.5 },
                }
              : { onClick: () => goTo(i) };

            return (
              <motion.div
                key={s.id}
                initial={false}
                animate={{
                  x: pose.x,
                  scale: pose.scale,
                  rotate: pose.rotate,
                  opacity: pose.opacity,
                  filter: `blur(${pose.blur}px)`,
                }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.6,
                  ease: [0.4, 0, 0.2, 1],
                }}
                style={{ zIndex: pose.z }}
                className={
                  "absolute inset-0 flex select-none items-center justify-center " +
                  (isCenter
                    ? "cursor-grab active:cursor-grabbing"
                    : "cursor-pointer")
                }
                aria-hidden={!isCenter}
                {...centerProps}
              >
                <motion.div
                  className="relative"
                  animate={
                    isCenter && !shouldReduceMotion
                      ? { y: [0, -14, 0] }
                      : { y: 0 }
                  }
                  transition={{
                    duration: 4.5,
                    repeat: isCenter && !shouldReduceMotion ? Infinity : 0,
                    ease: "easeInOut",
                  }}
                >
                  <Image
                    src={s.imagenBolsa}
                    alt={isCenter ? `Bolsa Que Nachos sabor ${s.nombre}` : ""}
                    width={520}
                    height={860}
                    priority={i === 0}
                    draggable={false}
                    sizes="(max-width: 640px) 70vw, (max-width: 1024px) 44vw, 32vw"
                    className="pointer-events-none block h-auto w-[70vw] max-w-[340px] drop-shadow-[0_50px_90px_rgba(0,0,0,0.6)] sm:w-[44vw] sm:max-w-[420px] lg:w-[32vw] lg:max-w-[470px]"
                  />
                  {isCenter && (
                    <div
                      aria-hidden="true"
                      className="absolute -bottom-3 left-1/2 -z-10 h-16 w-[78%] -translate-x-1/2 rounded-[100%]"
                      style={{
                        background: `radial-gradient(ellipse at center, ${active.colorTexto}66 0%, transparent 70%)`,
                        filter: "blur(22px)",
                      }}
                    />
                  )}
                </motion.div>
              </motion.div>
            );
          })}

          {/* decorativo flotante derecho (sabor activo) */}
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
              transition={{ duration: 0.75, ease: [0.4, 0, 0.2, 1], delay: 0.05 }}
              className="pointer-events-none absolute right-[3%] top-[4%] z-20 sm:right-[10%] sm:top-[2%]"
            >
              <motion.div
                animate={
                  shouldReduceMotion
                    ? undefined
                    : { y: [0, -10, 0], rotate: [0, 4, 0] }
                }
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              >
                <Image
                  src={active.decorativo}
                  alt=""
                  width={260}
                  height={260}
                  aria-hidden="true"
                  sizes="(max-width: 640px) 24vw, 16vw"
                  style={{ width: "auto", height: "auto" }}
                  className="h-auto w-[24vw] max-w-[120px] drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)] sm:w-[16vw] sm:max-w-[180px]"
                />
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ROW 3 — BOTTOM (CTA) */}
      <div className="relative z-20 px-4 pb-6 sm:px-8 sm:pb-8">

        <div className="mx-auto flex max-w-xl items-center justify-center">
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
            fullWidth
          >
            PEDÍ {active.nombre.toUpperCase()}
          </Button>
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
