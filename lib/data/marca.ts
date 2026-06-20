import type { Marca } from "@/lib/types";

export const MARCA: Marca = {
  nombre: "Que Nachos",
  razonSocial: "Nutravia SRL",
  tagline: "Disfruta tus nachos sin culpa",
  taglineSecundario: "18g de proteína · 3 sabores · 0 culpa",
  descripcionMeta:
    "Nachos horneados proteicos con 18g de proteína por bolsa. Tres sabores, hechos en Bolivia. Pedí por WhatsApp y recogé en Santa Cruz.",
  ciudad: "Santa Cruz de la Sierra",
  pais: "Bolivia",
  emailContacto: null,
  whatsappHorarios: "Lun–Vie 7:00 — 19:00",
};

export async function getMarca(): Promise<Marca> {
  return MARCA;
}
