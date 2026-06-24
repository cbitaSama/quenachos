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

        {/* Tabla nutricional oficial (porción 30 g · 2 por bolsa de 60 g) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mx-auto mt-12 max-w-2xl overflow-hidden rounded-[2rem] border border-[var(--color-negro)]/10 bg-white"
          style={{
            boxShadow:
              "0 1px 2px rgba(10,10,10,0.04), 0 12px 32px -8px rgba(10,10,10,0.12)",
          }}
        >
          <div className="border-b border-[var(--color-negro)]/10 px-6 py-5 sm:px-8">
            <p className="text-caption text-[var(--color-rojo)]">
              Información nutricional
            </p>
            <p className="mt-1 text-body-sm text-[var(--color-gris-500)]">
              Porción de{" "}
              <strong className="font-semibold text-[var(--color-negro)]">
                30 g
              </strong>{" "}
              · 2 porciones por bolsa (60 g)
            </p>
          </div>

          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="text-caption text-[var(--color-gris-500)]">
                <th className="px-6 py-3 font-medium sm:px-8">Nutriente</th>
                <th className="px-3 py-3 text-right font-medium">Porción</th>
                <th className="hidden px-6 py-3 text-right font-medium sm:table-cell sm:px-8">
                  100 g
                </th>
              </tr>
            </thead>
            <tbody>
              {NUTRICION.map((n) => (
                <tr
                  key={n.label}
                  className={`border-t border-[var(--color-negro)]/[0.07] ${
                    n.destacado ? "bg-[var(--color-rojo)]/[0.04]" : ""
                  }`}
                >
                  <td
                    className={`px-6 py-3.5 text-body-md sm:px-8 ${
                      n.destacado
                        ? "font-semibold text-[var(--color-rojo)]"
                        : "text-[var(--color-negro)]"
                    }`}
                  >
                    {n.label}
                  </td>
                  <td
                    className={`px-3 py-3.5 text-right text-body-md tabular-nums ${
                      n.destacado
                        ? "font-bold text-[var(--color-rojo)]"
                        : "font-medium text-[var(--color-negro)]"
                    }`}
                  >
                    {n.porcion}
                  </td>
                  <td className="hidden px-6 py-3.5 text-right text-body-md tabular-nums text-[var(--color-gris-500)] sm:table-cell sm:px-8">
                    {n.cien}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t border-[var(--color-negro)]/10 px-6 py-5 sm:px-8">
            <div className="flex flex-wrap gap-2">
              {[
                "Alto en proteína",
                "Sin gluten",
                "Sin lactosa",
                "Sin azúcares añadidos",
              ].map((b) => (
                <span
                  key={b}
                  className="rounded-full bg-[var(--color-verde-lima)]/15 px-3 py-1 text-body-sm font-medium text-[var(--color-negro)]"
                >
                  {b}
                </span>
              ))}
            </div>
            <p className="mt-4 text-body-sm text-[var(--color-gris-500)]">
              Valores verificados en laboratorio · LABROB · UAGRM.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

const NUTRICION: {
  label: string;
  porcion: string;
  cien: string;
  destacado?: boolean;
}[] = [
  { label: "Energía", porcion: "118 kcal", cien: "392 kcal" },
  { label: "Proteínas", porcion: "22,9 g", cien: "76,3 g", destacado: true },
  { label: "Carbohidratos", porcion: "0,5 g", cien: "1,5 g" },
  { label: "Azúcares añadidos", porcion: "0 g", cien: "0 g" },
  { label: "Grasa total", porcion: "2,7 g", cien: "9,0 g" },
];
