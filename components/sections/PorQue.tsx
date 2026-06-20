"use client";

import { motion } from "motion/react";
import { Drumstick, Zap, Flame } from "lucide-react";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";

const CARDS = [
  {
    icon: Drumstick,
    chip: "Proteína real",
    title: (
      <>
        <AnimatedNumber value={46} suffix="g" /> de proteína por bolsa
      </>
    ),
    body:
      "Pechuga de pollo 100% seleccionada y verificada en laboratorio (LABROB · UAGRM). Snackeás proteína de verdad, sin batidos ni polvos raros.",
    color: "var(--color-rojo)",
    accent: "bg-[var(--color-rojo)]",
  },
  {
    icon: Zap,
    chip: "Sin culpa",
    title: <>Horneados,<br/>nunca fritos</>,
    body:
      "Sin aceites raros, sin químicos extraños, sin lista de ingredientes que parece tarea de química. Solo lo que reconocés.",
    color: "var(--color-negro)",
    accent: "bg-[var(--color-negro)]",
  },
  {
    icon: Flame,
    chip: "Sabor real",
    title: <>Crocantes hasta<br/>el último</>,
    body:
      "No son los nachos «fit» que saben a cartón. Son nachos que comerías aunque no fueras al gym. De verdad.",
    color: "var(--color-verde-lima)",
    accent: "bg-[var(--color-verde-lima)]",
  },
];

export function PorQue() {
  return (
    <section
      id="por-que"
      aria-labelledby="por-que-title"
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
            ¿Por qué Que Nachos?
          </span>
          <h2
            id="por-que-title"
            className="mt-4 font-display text-display-md uppercase text-[var(--color-negro)]"
          >
            Snack con sentido.
            <br />
            <span className="text-[var(--color-rojo)]">Antojo sin culpa.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-body-lg text-[var(--color-gris-500)]">
            Tres razones para sumarte al team. Spoiler: la primera sola ya
            justifica el pedido.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-5 sm:gap-6 md:grid-cols-3">
          {CARDS.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.55, delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className="group relative overflow-hidden rounded-[2rem] border border-[var(--color-negro)]/10 bg-white p-7 transition-all duration-300 hover:border-[var(--color-rojo)]/30 sm:p-9"
                style={{
                  boxShadow:
                    "0 1px 2px rgba(10,10,10,0.04), 0 12px 32px -8px rgba(10,10,10,0.12)",
                }}
              >
                <div
                  className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-30"
                  style={{ backgroundColor: card.color }}
                />
                <div
                  className="inline-flex size-14 items-center justify-center rounded-2xl text-[var(--color-crema)]"
                  style={{ backgroundColor: card.color }}
                >
                  <Icon strokeWidth={2.25} className="size-7" />
                </div>
                <p className="mt-6 text-caption text-[var(--color-gris-500)]">
                  {card.chip}
                </p>
                <h3 className="mt-2 font-display text-[clamp(28px,3vw,40px)] leading-[1.05] tracking-tight text-[var(--color-negro)]">
                  {card.title}
                </h3>
                <p className="mt-4 text-body-md text-[var(--color-gris-500)]">
                  {card.body}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Tabla nutricional oficial (por bolsa de 60 g) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="mx-auto mt-10 max-w-4xl"
        >
          <div className="flex flex-col items-center gap-4 rounded-[2rem] border border-[var(--color-negro)]/10 bg-white px-6 py-6 sm:flex-row sm:justify-between sm:px-10">
            <div className="text-center sm:text-left">
              <p className="text-caption text-[var(--color-rojo)]">
                Tabla nutricional
              </p>
              <p className="mt-1 text-body-sm text-[var(--color-gris-500)]">
                Por bolsa de 60 g · verificado en laboratorio (LABROB · UAGRM)
              </p>
            </div>
            <dl className="grid grid-cols-3 gap-x-6 gap-y-3 text-center sm:grid-cols-5 sm:gap-x-8">
              {NUTRICION.map((n) => (
                <div key={n.label}>
                  <dt className="text-caption text-[var(--color-gris-500)]">
                    {n.label}
                  </dt>
                  <dd className="font-display text-[clamp(20px,2.4vw,30px)] leading-none text-[var(--color-negro)]">
                    {n.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

const NUTRICION = [
  { label: "Proteína", value: "46g" },
  { label: "Por 100g", value: "76,3g" },
  { label: "Gramaje", value: "60g" },
  { label: "Base", value: "Pollo" },
  { label: "Gluten", value: "0" },
];
