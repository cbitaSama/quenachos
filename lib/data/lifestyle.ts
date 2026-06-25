import type { FotoLifestyle } from "@/lib/types";

// Solo fotos reales (campañas + eventos de Que Nachos). Los placeholders SVG
// que estaban antes se quitaron a pedido del cliente.
export const LIFESTYLE: FotoLifestyle[] = [
  {
    id: "pareja-parque",
    src: "/lifestyle/pareja-parque.jpg",
    alt: "Pareja en el parque con polera y bolsa de Que Nachos",
    categoria: "pareja",
    orientacion: "vertical",
    prioridad: true,
  },
  {
    id: "evento-coffee-club",
    src: "/lifestyle/evento-coffee-club.jpg",
    alt: "Activación Que Nachos en Cold Coffee Club — chica con bolsa Limón",
    categoria: "evento",
    orientacion: "vertical",
    prioridad: true,
  },
  {
    id: "dj-evento",
    src: "/lifestyle/dj-evento.jpg",
    alt: "DJ en evento con bolsa de Que Nachos Limón",
    categoria: "evento",
    orientacion: "vertical",
  },
  {
    id: "evento-blonde",
    src: "/lifestyle/evento-blonde.jpg",
    alt: "Cold Coffee Club — chica con bolsa Limón Picante",
    categoria: "evento",
    orientacion: "vertical",
  },
  {
    id: "evento-limon",
    src: "/lifestyle/evento-limon.jpg",
    alt: "Chico en activación deportiva con bolsa Que Nachos Limón",
    categoria: "evento",
    orientacion: "vertical",
  },
  {
    id: "pareja-bolsas",
    src: "/lifestyle/pareja-bolsas.jpg",
    alt: "Pareja abriendo bolsas de Que Nachos negra y kraft",
    categoria: "pareja",
    orientacion: "vertical",
  },
  {
    id: "evento-visor",
    src: "/lifestyle/evento-visor.jpg",
    alt: "Cold Coffee Club — chica con visera y bolsa Que Nachos",
    categoria: "evento",
    orientacion: "vertical",
  },
  {
    id: "evento-running",
    src: "/lifestyle/evento-running.jpg",
    alt: "Activación en running club con bolsa Que Nachos Limón Picante",
    categoria: "running",
    orientacion: "vertical",
  },
  {
    id: "chica-bolsa-01",
    src: "/lifestyle/chica-bolsa.webp",
    alt: "Chica sosteniendo bolsa de Que Nachos",
    categoria: "casual",
    orientacion: "vertical",
  },
  {
    id: "mochila-gym",
    src: "/lifestyle/mochila-gym.jpg",
    alt: "Bolsa Que Nachos Limón Picante en la mochila del gym",
    categoria: "gym",
    orientacion: "vertical",
  },
  {
    id: "evento-grupo",
    src: "/lifestyle/evento-grupo.jpg",
    alt: "Grupo de chicas en Cold Coffee Club con bolsas Que Nachos",
    categoria: "grupo",
    orientacion: "vertical",
  },
  {
    id: "bolsas-kraft",
    src: "/lifestyle/bolsas-kraft.jpg",
    alt: "Chico con dos bolsas kraft de Que Nachos",
    categoria: "casual",
    orientacion: "vertical",
  },
  {
    id: "chica-comiendo-01",
    src: "/lifestyle/chica-comiendo.webp",
    alt: "Chica disfrutando nachos Que Nachos",
    categoria: "casual",
    orientacion: "vertical",
  },
  {
    id: "hicimos-match",
    src: "/lifestyle/hicimos-match.jpg",
    alt: "Hicimos Match — pareja compartiendo una bolsa de Que Nachos",
    categoria: "pareja",
    orientacion: "vertical",
  },
  {
    id: "make-snacks-sexy",
    src: "/lifestyle/make-snacks-sexy.jpg",
    alt: "Campaña Que Nachos — Make Snacks Sexy Again",
    categoria: "casual",
    orientacion: "vertical",
  },
  {
    id: "celular-fondo",
    src: "/lifestyle/celular-nachos.jpg",
    alt: "Celular con nachos de fondo",
    categoria: "casual",
    orientacion: "vertical",
  },
];

export async function getLifestyle(): Promise<FotoLifestyle[]> {
  return LIFESTYLE;
}
