import type { FotoLifestyle } from "@/lib/types";

// TODO: reemplazar con fotos originales del cliente (Drive/WeTransfer).
// Estas son las que tenemos de los recursos iniciales + placeholders genéricos.
export const LIFESTYLE: FotoLifestyle[] = [
  {
    id: "evento-coffee-club",
    src: "/lifestyle/evento-coffee-club.jpg",
    alt: "Activación Que Nachos en Cold Coffee Club — chica con bolsa Limón",
    categoria: "evento",
    orientacion: "vertical",
    prioridad: true,
  },
  {
    id: "evento-blonde",
    src: "/lifestyle/evento-blonde.jpg",
    alt: "Cold Coffee Club — chica con bolsa Limón Picante",
    categoria: "evento",
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
    id: "evento-grupo",
    src: "/lifestyle/evento-grupo.jpg",
    alt: "Grupo de chicas en Cold Coffee Club con bolsas Que Nachos",
    categoria: "grupo",
    orientacion: "vertical",
  },
  {
    id: "chica-bolsa-01",
    src: "/lifestyle/chica-bolsa.webp",
    alt: "Chica sosteniendo bolsa de Que Nachos",
    categoria: "casual",
    orientacion: "vertical",
    prioridad: true,
  },
  {
    id: "chica-comiendo-01",
    src: "/lifestyle/chica-comiendo.webp",
    alt: "Chica disfrutando nachos Que Nachos",
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
  {
    id: "placeholder-running",
    src: "/lifestyle/placeholder-running.svg",
    alt: "Equipo de running después de entrenar",
    categoria: "running",
    orientacion: "vertical",
  },
  {
    id: "placeholder-gym",
    src: "/lifestyle/placeholder-gym.svg",
    alt: "Snack post-entreno en el gym",
    categoria: "gym",
    orientacion: "vertical",
  },
  {
    id: "placeholder-evento",
    src: "/lifestyle/placeholder-evento.svg",
    alt: "Activación en evento Night Fest",
    categoria: "evento",
    orientacion: "vertical",
  },
  {
    id: "placeholder-grupo",
    src: "/lifestyle/placeholder-grupo.svg",
    alt: "Grupo de amigos compartiendo Que Nachos",
    categoria: "grupo",
    orientacion: "vertical",
  },
  {
    id: "placeholder-pareja",
    src: "/lifestyle/placeholder-pareja.svg",
    alt: "Pareja con peli y Que Nachos",
    categoria: "pareja",
    orientacion: "vertical",
  },
];

export async function getLifestyle(): Promise<FotoLifestyle[]> {
  return LIFESTYLE;
}
