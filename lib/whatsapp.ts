const WPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "59177376341";

export function whatsappLink(mensaje?: string): string {
  const base = `https://wa.me/${WPP}`;
  if (!mensaje) return base;
  return `${base}?text=${encodeURIComponent(mensaje)}`;
}

export const MENSAJES = {
  general: "Hola, quiero pedir Que Nachos 🌶️",
  porSabor: (sabor: string) => `Hola, quiero el sabor ${sabor} 🌶️`,
  evento:
    "¡Hola! Quiero llevar Que Nachos a un evento. ¿Me cuentan opciones y precios?",
  recojo: "Hola, quiero coordinar un recojo en el punto de Santa Cruz.",
  pack: "Hola, quiero un combo de los 3 sabores 🍗🍋🌶️",
  carrito: (
    items: { nombre: string; cantidad: number; precio: number | null }[],
    total: number,
  ) => {
    const lineas = items
      .map((i) => {
        const sub =
          i.precio != null ? ` — Bs ${i.precio * i.cantidad}` : "";
        return `• ${i.nombre} x${i.cantidad}${sub}`;
      })
      .join("\n");
    const totalLinea = total > 0 ? `\n\n*Total: Bs ${total}*` : "";
    return `¡Hola! Quiero hacer este pedido de Que Nachos 🌶️\n\n${lineas}${totalLinea}\n\n¿Me confirman disponibilidad y coordinamos el recojo? 🙌`;
  },
};
