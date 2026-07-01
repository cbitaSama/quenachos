export function formatBs(n: number | null | undefined): string {
  const v = Number(n ?? 0);
  return `Bs ${v.toLocaleString("es-BO", { maximumFractionDigits: 2 })}`;
}

export function formatFecha(d: string | Date | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("es-BO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatFechaHora(d: string | Date | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("es-BO", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Formatea una fecha "YYYY-MM-DD" (sin hora) sin correrla por zona horaria.
export function formatDia(d: string | null | undefined): string {
  if (!d) return "—";
  const [y, m, day] = d.slice(0, 10).split("-").map(Number);
  if (!y || !m || !day) return "—";
  const date = new Date(y, m - 1, day);
  return date.toLocaleDateString("es-BO", { day: "2-digit", month: "short", year: "numeric" });
}

export type EstadoVencimiento = "vencido" | "pronto" | "ok";

// dias < 0 → vencido (rojo) · ≤30 → pronto (amarillo) · resto → ok
export function estadoVencimiento(
  venc: string | Date | null | undefined,
): { estado: EstadoVencimiento; dias: number } {
  if (!venc) return { estado: "ok", dias: Infinity };
  const date = typeof venc === "string" ? new Date(venc) : venc;
  const hoy = new Date();
  const dias = Math.floor(
    (date.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24),
  );
  const estado: EstadoVencimiento =
    dias < 0 ? "vencido" : dias <= 30 ? "pronto" : "ok";
  return { estado, dias };
}

export const SABOR_COLOR: Record<string, string> = {
  clasico: "#F11C1F",
  limon: "#A3E635",
  "limon-picante": "#FF1F1F",
};
