export type SaborId = "clasico" | "limon" | "picante" | "limon-picante";

export type Sabor = {
  id: SaborId;
  nombre: string;
  subtitulo: string;
  emoji: string;
  descripcionCorta: string;
  precio?: number;
  proteinaG: number;
  colorTexto: string;
  colorFondo: string;
  colorAcento: string;
  imagenBolsa: string;
  decorativo: string;
  orden: number;
  activo: boolean;
};

export type FotoLifestyle = {
  id: string;
  src: string;
  alt: string;
  categoria: "running" | "gym" | "evento" | "casual" | "grupo" | "pareja";
  orientacion: "vertical" | "horizontal";
  prioridad?: boolean;
};

export type HorarioDia = {
  dias: string;
  apertura: string;
  cierre: string;
};

export type Ubicacion = {
  nombre: string;
  landmark: string;
  ciudad: string;
  coordenadas: { lat: number; lng: number };
  horarios: HorarioDia[];
  googleMapsUrl: string;
  googleMapsEmbedUrl: string;
};

export type Marca = {
  nombre: string;
  razonSocial: string;
  tagline: string;
  taglineSecundario: string;
  descripcionMeta: string;
  ciudad: string;
  pais: string;
  emailContacto: string | null;
  whatsappHorarios: string;
};
