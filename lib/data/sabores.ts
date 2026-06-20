import type { Sabor } from "@/lib/types";

export const SABORES: Sabor[] = [
  {
    id: "clasico",
    nombre: "Tradicional",
    subtitulo: "el confiable",
    emoji: "🧀",
    descripcionCorta:
      "El que nunca falla. Crocante, salado, perfecto para todo momento.",
    precio: 30,
    proteinaG: 18,
    colorTexto: "#FAF7F2",
    colorFondo: "#F11C1F",
    colorAcento: "#FFD93D",
    imagenBolsa: "/sabores/bolsa-clasico.png",
    decorativo: "/sabores/flotante-queso.png",
    orden: 1,
    activo: true,
  },
  {
    id: "limon",
    nombre: "Limón",
    subtitulo: "el coquetito",
    emoji: "🍋",
    descripcionCorta:
      "Fresco, cítrico, con esa chispa ácida que te despierta el antojo.",
    precio: 35,
    proteinaG: 18,
    colorTexto: "#A3E635",
    colorFondo: "#0A0A0A",
    colorAcento: "#FAF7F2",
    imagenBolsa: "/sabores/bolsa-limon.png",
    decorativo: "/sabores/flotante-limon.png",
    orden: 2,
    activo: true,
  },
  {
    id: "limon-picante",
    nombre: "Limón Picante",
    subtitulo: "el que no se decide",
    emoji: "🌶️🍋",
    descripcionCorta:
      "Lo mejor de los dos mundos: cítrico al inicio, fuego al final.",
    precio: 35,
    proteinaG: 18,
    colorTexto: "#A3E635",
    colorFondo: "#0A0A0A",
    colorAcento: "#FF1F1F",
    imagenBolsa: "/sabores/bolsa-limon-picante.png",
    decorativo: "/sabores/flotante-chili-limon.svg",
    orden: 3,
    activo: true,
  },
];

export async function getSabores(): Promise<Sabor[]> {
  return SABORES.filter((s) => s.activo).sort((a, b) => a.orden - b.orden);
}

export async function getSaborById(id: string): Promise<Sabor | null> {
  return SABORES.find((s) => s.id === id) ?? null;
}
