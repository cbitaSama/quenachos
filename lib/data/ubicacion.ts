import type { Ubicacion } from "@/lib/types";

const LAT = Number(process.env.NEXT_PUBLIC_PICKUP_LAT ?? -17.741199);
const LNG = Number(process.env.NEXT_PUBLIC_PICKUP_LNG ?? -63.178905);

export const UBICACION: Ubicacion = {
  nombre: "Punto de recojo",
  landmark: "Buscá el cartel que dice NUTRAVIA SRL",
  ciudad: "Santa Cruz de la Sierra, Bolivia",
  coordenadas: { lat: LAT, lng: LNG },
  horarios: [
    { dias: "Lunes a Viernes", apertura: "09:00", cierre: "16:00" },
    { dias: "Sábado", apertura: "09:00", cierre: "12:00" },
  ],
  googleMapsUrl: "https://maps.app.goo.gl/MPdTU4TkG2d4U6p89",
  googleMapsEmbedUrl: `https://www.google.com/maps?q=${LAT},${LNG}&hl=es&z=16&output=embed`,
};

export async function getUbicacion(): Promise<Ubicacion> {
  return UBICACION;
}
