"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { enviarWhatsApp, enviarWhatsAppImagen, aChatId, QR_PAGO_URL, QR_PAGO_SIN_FACTURA_URL } from "@/lib/waha";
import { setBotActivo } from "@/lib/n8n";
import { getAdmin, isDbConfigured } from "./db";

export type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string };

// Devuelve el email solo si la sesión es de un admin autorizado.
// Si ADMIN_EMAILS está seteada (lista separada por comas), exige que el email
// esté en ella. Sin esa env, acepta cualquier sesión válida (configurar en prod
// + deshabilitar signups en Supabase Auth).
async function adminEmail(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const email = user?.email ?? null;
  if (!email) return null;

  const allow = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (allow.length > 0 && !allow.includes(email.toLowerCase())) return null;
  return email;
}

function clean(msg: string | undefined): string {
  return (msg ?? "").replace(/^.*?ERROR:\s*/i, "").trim() || "Error en la base de datos.";
}

// Solo aceptamos links http(s) para el GPS (evita javascript:/data: → XSS al renderizar).
function safeUrl(u?: string | null): string | null {
  const v = (u ?? "").trim();
  return /^https?:\/\//i.test(v) ? v : null;
}

// Confirma el comprobante → confirmar_pedido es el ÚNICO punto que baja stock.
export async function confirmarPedido(pedidoId: string): Promise<ActionResult> {
  if (!isDbConfigured) return { ok: false, error: "Base de datos no configurada." };
  if (!pedidoId) return { ok: false, error: "Falta el pedido." };
  const email = await adminEmail();
  if (!email) return { ok: false, error: "Tu sesión expiró. Volvé a entrar." };

  const { data, error } = await getAdmin().rpc("qn_confirmar_pedido", {
    p_pedido_id: pedidoId,
    p_admin: email,
  });
  if (error) return { ok: false, error: clean(error.message) };

  // Avisar al cliente por WhatsApp (best-effort). Usamos el teléfono real (@c.us):
  // el chat_id guardado puede ser un @lid que no resuelve en envíos "en frío".
  // Para cuenta corriente, qn_confirmar_pedido ya devuelve el teléfono del contacto que pidió.
  const res = data as {
    chat_id?: string | null;
    telefono?: string | null;
    modalidad?: string | null;
  } | null;
  const tel = (res?.telefono ?? "").replace(/\D/g, "");
  const chatId = tel ? `${tel}@c.us` : (res?.chat_id ?? null);
  const esCredito = res?.modalidad === "cuenta_corriente";
  const mensaje = esCredito
    ? "📦 ¡Tu pedido fue despachado! 🎉 Ya salió y te llega por *Yango* en unos *20 minutos*. ¡Gracias! 🌶️"
    : "✅ ¡Tu pago fue confirmado! 🎉 Tu pedido ya salió y te llega por *Yango* en unos *20 minutos*. ¡Gracias por elegir Que Nachos! 🌶️";
  let avisado = false;
  if (chatId) {
    avisado = await enviarWhatsApp(chatId, mensaje);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin/inventario");
  return {
    ok: true,
    message: avisado
      ? "Pedido confirmado, stock descontado y cliente avisado por WhatsApp."
      : "Pedido confirmado y despachado.",
  };
}

// Borra un pedido. La RPC devuelve el stock si estaba despachado y bloquea
// los pedidos ya facturados (esos se manejan desde Cuentas). Destructivo: la UI
// confirma antes de llamarla.
export async function eliminarPedido(pedidoId: string): Promise<ActionResult> {
  if (!isDbConfigured) return { ok: false, error: "Base de datos no configurada." };
  if (!pedidoId) return { ok: false, error: "Falta el pedido." };
  const email = await adminEmail();
  if (!email) return { ok: false, error: "Tu sesión expiró. Volvé a entrar." };

  const { error } = await getAdmin().rpc("qn_eliminar_pedido", {
    p_pedido_id: pedidoId,
    p_admin: email,
  });
  if (error) return { ok: false, error: clean(error.message) };

  revalidatePath("/admin");
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin/inventario");
  return { ok: true, message: "Pedido eliminado." };
}

// Resuelve una atención humana → reactiva el bot para ese cliente.
export async function resolverAtencion(id: string): Promise<ActionResult> {
  if (!isDbConfigured) return { ok: false, error: "Base de datos no configurada." };
  if (!id) return { ok: false, error: "Falta la atención." };
  const email = await adminEmail();
  if (!email) return { ok: false, error: "Tu sesión expiró. Volvé a entrar." };

  const { error } = await getAdmin().rpc("qn_atencion_resolver", { p_id: id });
  if (error) return { ok: false, error: clean(error.message) };

  revalidatePath("/admin");
  revalidatePath("/admin/atencion");
  return { ok: true, message: "Resuelto. El bot vuelve a atender a ese cliente." };
}

// Pausa manual del bot para un número: lo atiende el dueño a mano.
// Se reactiva con "Solucionado, activar bot" (resolverAtencion).
export async function pausarNumero(input: {
  telefono: string;
  nombre?: string;
}): Promise<ActionResult> {
  if (!isDbConfigured) return { ok: false, error: "Base de datos no configurada." };
  const tel = (input.telefono || "").replace(/\D/g, "");
  if (!tel) return { ok: false, error: "Poné un número válido (solo dígitos)." };
  const email = await adminEmail();
  if (!email) return { ok: false, error: "Tu sesión expiró. Volvé a entrar." };

  const { data, error } = await getAdmin().rpc("qn_pausar_numero", {
    p_telefono: tel,
    p_nombre: input.nombre || null,
  });
  if (error) return { ok: false, error: clean(error.message) };
  const r = data as { ok?: boolean; ya_pausado?: boolean; error?: string } | null;
  if (!r?.ok) return { ok: false, error: r?.error ?? "No se pudo pausar." };

  revalidatePath("/admin/atencion");
  return {
    ok: true,
    message: r.ya_pausado
      ? "Ese número ya estaba pausado."
      : "Bot pausado para ese número. Atendelo vos; cuando termines, tocá “Activar bot”.",
  };
}

// Silencio permanente: el bot ignora el número por completo (sin cola, sin avisos).
// Para contactos que NO debe atender el bot: abogado, proveedores que maneja el dueño, etc.
export async function silenciarNumero(input: {
  telefono: string;
  etiqueta?: string;
}): Promise<ActionResult> {
  if (!isDbConfigured) return { ok: false, error: "Base de datos no configurada." };
  const tel = (input.telefono || "").replace(/\D/g, "");
  if (!tel) return { ok: false, error: "Poné un número válido (solo dígitos)." };
  const email = await adminEmail();
  if (!email) return { ok: false, error: "Tu sesión expiró. Volvé a entrar." };

  const { data, error } = await getAdmin().rpc("qn_silenciar_numero", {
    p_telefono: tel,
    p_etiqueta: input.etiqueta || null,
  });
  if (error) return { ok: false, error: clean(error.message) };
  const r = data as { ok?: boolean; error?: string } | null;
  if (!r?.ok) return { ok: false, error: r?.error ?? "No se pudo silenciar." };

  revalidatePath("/admin/atencion");
  revalidatePath("/admin/cuentas");
  return { ok: true, message: "Listo. El bot va a ignorar ese número (sin avisos)." };
}

export async function quitarSilencio(telefono: string): Promise<ActionResult> {
  if (!isDbConfigured) return { ok: false, error: "Base de datos no configurada." };
  const tel = (telefono || "").replace(/\D/g, "");
  if (!tel) return { ok: false, error: "Falta el número." };
  const email = await adminEmail();
  if (!email) return { ok: false, error: "Tu sesión expiró. Volvé a entrar." };

  const { error } = await getAdmin().rpc("qn_quitar_silencio", { p_telefono: tel });
  if (error) return { ok: false, error: clean(error.message) };

  revalidatePath("/admin/atencion");
  revalidatePath("/admin/cuentas");
  return { ok: true, message: "El bot vuelve a atender ese número." };
}

// Enciende/apaga el bot completo (workflow de n8n). Off = no responde a nadie.
export async function toggleBotGlobal(active: boolean): Promise<ActionResult> {
  const email = await adminEmail();
  if (!email) return { ok: false, error: "Tu sesión expiró. Volvé a entrar." };

  const r = await setBotActivo(active);
  if (!r.ok)
    return {
      ok: false,
      error: `No se pudo ${active ? "encender" : "apagar"} el bot: ${r.error}`,
    };

  revalidatePath("/admin/atencion");
  return {
    ok: true,
    message: active ? "Bot encendido. Ya responde a todos." : "Bot apagado. No responde a nadie.",
  };
}

export async function registrarProduccion(input: {
  saborId: string;
  cantidad: number;
  lote?: string | null;
  vencimiento?: string | null; // null → la RPC pone +90 días
}): Promise<ActionResult> {
  if (!isDbConfigured) return { ok: false, error: "Base de datos no configurada." };
  if (!input.saborId) return { ok: false, error: "Elegí un sabor." };
  if (!(input.cantidad > 0)) return { ok: false, error: "La cantidad debe ser mayor a 0." };
  const email = await adminEmail();
  if (!email) return { ok: false, error: "Tu sesión expiró. Volvé a entrar." };

  const { error } = await getAdmin().rpc("qn_registrar_produccion", {
    p_sabor_id: input.saborId,
    p_cantidad: Math.floor(input.cantidad),
    p_lote: input.lote?.trim() || null,
    p_vencimiento: input.vencimiento || null,
    p_creado_por: email,
  });
  if (error) return { ok: false, error: clean(error.message) };

  revalidatePath("/admin");
  revalidatePath("/admin/inventario");
  revalidatePath("/admin/produccion");
  return { ok: true, message: "Producción registrada." };
}

// Venta física en persona (mostrador). Crea el pedido a precio cliente, lo
// confirma y descuenta inventario en un solo paso. No pasa por el bot.
export async function registrarVentaFisica(input: {
  items: { saborId: string; cantidad: number }[];
  nota?: string | null;
}): Promise<ActionResult> {
  if (!isDbConfigured) return { ok: false, error: "Base de datos no configurada." };
  const email = await adminEmail();
  if (!email) return { ok: false, error: "Tu sesión expiró. Volvé a entrar." };

  const items = (input.items ?? [])
    .filter((i) => i.saborId && Number(i.cantidad) > 0)
    .map((i) => ({ sabor_id: i.saborId, cantidad: Math.floor(Number(i.cantidad)) }));
  if (items.length === 0) return { ok: false, error: "Agregá al menos un producto." };

  const { error } = await getAdmin().rpc("qn_registrar_venta_fisica", {
    p_items: items,
    p_admin: email,
    p_nota: input.nota?.trim() || null,
  });
  if (error) return { ok: false, error: clean(error.message) };

  revalidatePath("/admin");
  revalidatePath("/admin/venta-fisica");
  revalidatePath("/admin/inventario");
  return { ok: true, message: "Venta registrada y descontada del stock." };
}

// Venta directa desde el panel: cobro al instante (mostrador, contado) o cargada
// a la cuenta de un proveedor (queda como deuda en su cuenta corriente).
// Regla de precio: >=25 bolsas → precio proveedor; el flag con/sin factura elige el tier.
// La mercadería ya salió → la RPC descuenta stock al instante (no pasa por el bot).
export async function registrarVentaDirecta(input: {
  items: { saborId: string; cantidad: number }[];
  clienteId?: string | null; // null/undefined → mostrador (contado)
  conFactura?: boolean;
  nota?: string | null;
}): Promise<ActionResult> {
  if (!isDbConfigured) return { ok: false, error: "Base de datos no configurada." };
  const email = await adminEmail();
  if (!email) return { ok: false, error: "Tu sesión expiró. Volvé a entrar." };

  const items = (input.items ?? [])
    .filter((i) => i.saborId && Number(i.cantidad) > 0)
    .map((i) => ({ sabor_id: i.saborId, cantidad: Math.floor(Number(i.cantidad)) }));
  if (items.length === 0) return { ok: false, error: "Agregá al menos un producto." };

  const { data, error } = await getAdmin().rpc("qn_registrar_venta_directa", {
    p_items: items,
    p_cliente_id: input.clienteId || null,
    p_con_factura: !!input.conFactura,
    p_admin: email,
    p_nota: input.nota?.trim() || null,
  });
  if (error) return { ok: false, error: clean(error.message) };

  const r = data as { total_bs?: number; modalidad?: string } | null;
  const totalTxt = `Bs ${Number(r?.total_bs ?? 0).toLocaleString("es-BO")}`;

  revalidatePath("/admin");
  revalidatePath("/admin/venta-fisica");
  revalidatePath("/admin/inventario");
  revalidatePath("/admin/cuentas");
  return {
    ok: true,
    message:
      r?.modalidad === "cuenta_corriente"
        ? `Cargado a la cuenta: ${totalTxt} de deuda. Stock descontado.`
        : `Venta registrada por ${totalTxt} y descontada del stock.`,
  };
}

// Corrige una producción cargada por error (ajusta el stock).
export async function editarProduccion(input: {
  movId: string;
  cantidad: number;
  lote?: string | null;
  vencimiento?: string | null;
}): Promise<ActionResult> {
  if (!isDbConfigured) return { ok: false, error: "Base de datos no configurada." };
  if (!input.movId) return { ok: false, error: "Falta el registro." };
  if (!(input.cantidad > 0)) return { ok: false, error: "La cantidad debe ser mayor a 0." };
  const email = await adminEmail();
  if (!email) return { ok: false, error: "Tu sesión expiró. Volvé a entrar." };

  const { error } = await getAdmin().rpc("qn_editar_produccion", {
    p_mov_id: input.movId,
    p_cantidad: Math.floor(input.cantidad),
    p_lote: input.lote?.trim() || null,
    p_vencimiento: input.vencimiento || null,
    p_admin: email,
  });
  if (error) return { ok: false, error: clean(error.message) };

  revalidatePath("/admin");
  revalidatePath("/admin/inventario");
  revalidatePath("/admin/produccion");
  return { ok: true, message: "Producción corregida." };
}

export async function eliminarProduccion(movId: string): Promise<ActionResult> {
  if (!isDbConfigured) return { ok: false, error: "Base de datos no configurada." };
  if (!movId) return { ok: false, error: "Falta el registro." };
  const email = await adminEmail();
  if (!email) return { ok: false, error: "Tu sesión expiró. Volvé a entrar." };

  const { error } = await getAdmin().rpc("qn_eliminar_produccion", {
    p_mov_id: movId,
    p_admin: email,
  });
  if (error) return { ok: false, error: clean(error.message) };

  revalidatePath("/admin");
  revalidatePath("/admin/inventario");
  revalidatePath("/admin/produccion");
  return { ok: true, message: "Producción eliminada." };
}

export async function cerrarFactura(input: {
  clienteId: string;
  inicio: string;
  fin: string;
  fechaPago?: string | null;
}): Promise<ActionResult> {
  if (!isDbConfigured) return { ok: false, error: "Base de datos no configurada." };
  if (!input.clienteId) return { ok: false, error: "Elegí un cliente." };
  const email = await adminEmail();
  if (!email) return { ok: false, error: "Tu sesión expiró. Volvé a entrar." };

  const { error } = await getAdmin().rpc("qn_cerrar_factura", {
    p_cliente_id: input.clienteId,
    p_inicio: input.inicio,
    p_fin: input.fin,
    p_fecha_pago: input.fechaPago || null,
  });
  if (error) return { ok: false, error: clean(error.message) };

  revalidatePath("/admin/cuentas");
  return { ok: true, message: "Factura cerrada." };
}

// Cobrar una cuenta a crédito (1 clic): cierra el ciclo y le manda al cliente
// el total + el QR de pago por WhatsApp. La deuda recién se salda al confirmar el pago.
export async function cobrarCuenta(clienteId: string): Promise<ActionResult> {
  if (!isDbConfigured) return { ok: false, error: "Base de datos no configurada." };
  if (!clienteId) return { ok: false, error: "Falta la cuenta." };
  const email = await adminEmail();
  if (!email) return { ok: false, error: "Tu sesión expiró. Volvé a entrar." };

  const { data, error } = await getAdmin().rpc("qn_cobrar_cuenta", {
    p_cliente_id: clienteId,
  });
  if (error) return { ok: false, error: clean(error.message) };
  const r = data as {
    ok?: boolean;
    error?: string;
    total_bs?: number;
    empresa?: string;
    sin_factura?: boolean;
    total_bolsas?: number;
    detalle?: { sabor: string; cantidad: number; subtotal: number }[];
    contactos?: { telefono: string; nombre: string }[];
  } | null;
  if (!r?.ok) return { ok: false, error: r?.error ?? "No se pudo generar el cobro." };

  const totalTxt = `Bs ${Number(r.total_bs ?? 0).toLocaleString("es-BO")}`;
  // Desglose claro: una línea por sabor (cantidad + subtotal) + total de bolsas y precio.
  const lineas = (r.detalle ?? [])
    .map((d) => `• ${d.cantidad} ${d.sabor} — Bs ${Number(d.subtotal).toLocaleString("es-BO")}`)
    .join("\n");
  const texto =
    `Hola! 📋 Cierre de cuenta de *${r.empresa ?? "tu cuenta"}*.\n` +
    `Este período pediste:\n${lineas}\n` +
    `*Total: ${r.total_bolsas ?? 0} bolsas — ${totalTxt}*\n` +
    `Te paso el QR para el pago 🙏 Cuando pagues, mandame la captura del comprobante por acá.`;
  // El cobro va al ENCARGADO de cobro = el primer contacto agregado (no a todos).
  const encargado = (r.contactos ?? [])[0];
  const chatId = encargado ? aChatId(encargado.telefono) : null;
  let avisado = false;
  let qrOk = false;
  if (chatId) {
    avisado = await enviarWhatsApp(chatId, texto);
    // Proveedor sin factura (empresa sin NIT) → QR a la otra cuenta; el resto, el de siempre.
    const qrUrl = r.sin_factura ? QR_PAGO_SIN_FACTURA_URL : QR_PAGO_URL;
    if (qrUrl.startsWith("http")) {
      qrOk = await enviarWhatsAppImagen(chatId, qrUrl, "QR para el pago de tu cuenta");
    }
  }

  revalidatePath("/admin/cuentas");
  return {
    ok: true,
    message: avisado
      ? qrOk
        ? `Cobro de ${totalTxt} enviado a ${encargado?.nombre ?? "el encargado"} (con QR).`
        : `Cobro de ${totalTxt} enviado, pero el QR no se pudo mandar (revisá WAHA / el QR en Ajustes).`
      : `Factura generada por ${totalTxt}, pero no se pudo enviar el WhatsApp (revisá WAHA).`,
  };
}

// Borra una cuenta corriente completa (contactos, pedidos, facturas e historial).
// Destructivo: la UI confirma antes de llamarla.
export async function eliminarCuenta(clienteId: string): Promise<ActionResult> {
  if (!isDbConfigured) return { ok: false, error: "Base de datos no configurada." };
  if (!clienteId) return { ok: false, error: "Falta la cuenta." };
  const email = await adminEmail();
  if (!email) return { ok: false, error: "Tu sesión expiró. Volvé a entrar." };

  const { error } = await getAdmin().rpc("qn_eliminar_cuenta", { p_cliente_id: clienteId });
  if (error) return { ok: false, error: clean(error.message) };

  revalidatePath("/admin/cuentas");
  return { ok: true, message: "Cuenta eliminada." };
}

// ── Cuentas corrientes (proveedores / clientes a crédito) ───────────────────

export async function crearCuenta(input: {
  razonSocial: string;
  contacto?: string | null;
  telefono?: string | null;
  ciclo?: string;
  diaCorte?: number;
  cadaDias?: number | null;
  direccion?: string | null;
  gps?: string | null;
  nit?: string | null;
}): Promise<ActionResult> {
  if (!isDbConfigured) return { ok: false, error: "Base de datos no configurada." };
  if (!input.razonSocial?.trim() && !input.contacto?.trim()) {
    return { ok: false, error: "Poné al menos la razón social o el contacto." };
  }
  const email = await adminEmail();
  if (!email) return { ok: false, error: "Tu sesión expiró. Volvé a entrar." };

  const { error } = await getAdmin().rpc("qn_crear_cuenta", {
    p_razon_social: input.razonSocial?.trim() || null,
    p_contacto: input.contacto?.trim() || null,
    p_telefono: input.telefono?.trim() || null,
    p_ciclo: input.ciclo || "mensual",
    p_dia_corte: input.diaCorte ?? 1,
    p_cada_dias: input.cadaDias ?? null,
    p_direccion: input.direccion?.trim() || null,
    p_gps: safeUrl(input.gps),
    p_nit: input.nit?.trim() || null,
  });
  if (error) return { ok: false, error: clean(error.message) };

  revalidatePath("/admin/cuentas");
  return { ok: true, message: "Cuenta corriente creada." };
}

// Cambia el ciclo de cobro de una cuenta existente.
//  - 'mensual' / 'trimestral' → corte por día del mes (diaCorte).
//  - 'dias'                   → cada N días (cadaDias), anclado al primer pedido sin facturar.
//  - 'consignacion'           → sin corte fijo, se cobra a demanda.
export async function setCicloCuenta(input: {
  clienteId: string;
  ciclo: string;
  diaCorte?: number | null;
  cadaDias?: number | null;
}): Promise<ActionResult> {
  if (!isDbConfigured) return { ok: false, error: "Base de datos no configurada." };
  if (!input.clienteId) return { ok: false, error: "Falta la cuenta." };
  if (!(await adminEmail())) return { ok: false, error: "Tu sesión expiró. Volvé a entrar." };
  if (input.ciclo === "dias" && !(Number(input.cadaDias) > 0)) {
    return { ok: false, error: 'Para "cada N días" poné un número de días mayor a 0.' };
  }

  const { error } = await getAdmin().rpc("qn_set_ciclo_cuenta", {
    p_cliente_id: input.clienteId,
    p_ciclo: input.ciclo,
    p_dia_corte: input.diaCorte ?? null,
    p_cada_dias: input.ciclo === "dias" ? Math.floor(Number(input.cadaDias)) : null,
  });
  if (error) return { ok: false, error: clean(error.message) };

  revalidatePath("/admin/cuentas");
  return { ok: true, message: "Ciclo de cobro actualizado." };
}

export async function agregarContacto(input: {
  clienteId: string;
  nombre: string;
  telefono: string;
}): Promise<ActionResult> {
  if (!isDbConfigured) return { ok: false, error: "Base de datos no configurada." };
  if (!input.clienteId) return { ok: false, error: "Falta la cuenta." };
  if (!input.nombre?.trim()) return { ok: false, error: "Falta el nombre." };
  if (!input.telefono?.trim()) return { ok: false, error: "Falta el teléfono." };
  if (!(await adminEmail())) return { ok: false, error: "Tu sesión expiró. Volvé a entrar." };

  const { error } = await getAdmin().rpc("qn_agregar_contacto", {
    p_cliente_id: input.clienteId,
    p_nombre: input.nombre.trim(),
    p_telefono: input.telefono.trim(),
  });
  if (error) return { ok: false, error: clean(error.message) };

  revalidatePath("/admin/cuentas");
  return { ok: true, message: "Contacto autorizado." };
}

export async function quitarContacto(contactoId: string): Promise<ActionResult> {
  if (!isDbConfigured) return { ok: false, error: "Base de datos no configurada." };
  if (!contactoId) return { ok: false, error: "Falta el contacto." };
  if (!(await adminEmail())) return { ok: false, error: "Tu sesión expiró. Volvé a entrar." };

  const { error } = await getAdmin().rpc("qn_quitar_contacto", {
    p_contacto_id: contactoId,
  });
  if (error) return { ok: false, error: clean(error.message) };

  revalidatePath("/admin/cuentas");
  return { ok: true };
}

export async function setDireccionCuenta(input: {
  clienteId: string;
  direccion: string;
  gps?: string | null;
  nit?: string | null;
}): Promise<ActionResult> {
  if (!isDbConfigured) return { ok: false, error: "Base de datos no configurada." };
  if (!input.clienteId) return { ok: false, error: "Falta la cuenta." };

  const { error } = await getAdmin().rpc("qn_set_direccion_cuenta", {
    p_cliente_id: input.clienteId,
    p_direccion: input.direccion?.trim() || null,
    p_gps: safeUrl(input.gps),
    p_nit: input.nit?.trim() || null,
  });
  if (error) return { ok: false, error: clean(error.message) };

  revalidatePath("/admin/cuentas");
  return { ok: true, message: "Dirección actualizada." };
}

// QR de pago: las imágenes que el bot manda al cliente. Darko las cambia desde /admin/ajustes.
// Se guardan en las rutas públicas que usan el bot y el cobro del panel:
//  - "normal"      → qn-assets/qr-pago.jpeg (pedidos normales y proveedor con factura).
//  - "sin_factura" → qn-assets/qr-pago-sin-factura.jpeg (solo proveedor sin factura).
const QR_BUCKET = "qn-assets";
const QR_PATHS = {
  normal: "qr-pago.jpeg",
  sin_factura: "qr-pago-sin-factura.jpeg",
} as const;
type QrTipo = keyof typeof QR_PATHS;

export async function actualizarQrPago(formData: FormData): Promise<ActionResult> {
  if (!isDbConfigured) return { ok: false, error: "Base de datos no configurada." };
  const email = await adminEmail();
  if (!email) return { ok: false, error: "Tu sesión expiró. Volvé a entrar." };

  const tipo: QrTipo = formData.get("tipo") === "sin_factura" ? "sin_factura" : "normal";

  const file = formData.get("qr");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Elegí una imagen del QR." };
  }
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    return { ok: false, error: "Solo JPG, PNG o WebP." };
  }
  if (file.size > 4 * 1024 * 1024) {
    return { ok: false, error: "La imagen pesa demasiado (máx 4 MB)." };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error } = await getAdmin()
    .storage.from(QR_BUCKET)
    .upload(QR_PATHS[tipo], bytes, { upsert: true, contentType: file.type });
  if (error) return { ok: false, error: clean(error.message) };

  revalidatePath("/admin/ajustes");
  return { ok: true, message: "QR de pago actualizado. El bot ya lo manda." };
}

// Confirma el PAGO de una factura (cobro consolidado). NO toca inventario.
export async function pagarFactura(input: {
  facturaId: string;
  comprobantePath?: string | null;
}): Promise<ActionResult> {
  if (!isDbConfigured) return { ok: false, error: "Base de datos no configurada." };
  if (!input.facturaId) return { ok: false, error: "Falta la factura." };
  const email = await adminEmail();
  if (!email) return { ok: false, error: "Tu sesión expiró. Volvé a entrar." };

  const { data, error } = await getAdmin().rpc("qn_pagar_factura", {
    p_factura_id: input.facturaId,
    p_admin: email,
    p_comprobante: input.comprobantePath || null,
  });
  if (error) return { ok: false, error: clean(error.message) };

  // Avisar al cliente que su pago fue confirmado (best-effort).
  const contactos = (data as { contactos?: string[] } | null)?.contactos ?? [];
  for (const tel of contactos) {
    const chatId = aChatId(tel);
    if (chatId) {
      await enviarWhatsApp(
        chatId,
        "✅ ¡Pago recibido y confirmado! 🎉 Tu cuenta quedó al día. ¡Gracias por elegir Que Nachos! 🌶️",
      );
    }
  }

  revalidatePath("/admin/cuentas");
  return { ok: true, message: "Pago confirmado. Deuda saldada." };
}

// ── Precios (editor de 4 tiers por sabor) ────────────────────────────────────

export async function actualizarPrecios(input: {
  saborId: string;
  sinFactura: number;
  conFactura: number;
  provSinFactura: number;
  provConFactura: number;
}): Promise<ActionResult> {
  if (!isDbConfigured) return { ok: false, error: "Base de datos no configurada." };
  if (!input.saborId) return { ok: false, error: "Falta el sabor." };
  const vals = [input.sinFactura, input.conFactura, input.provSinFactura, input.provConFactura];
  if (vals.some((v) => !(Number(v) > 0))) {
    return { ok: false, error: "Todos los precios deben ser mayores a 0." };
  }
  const email = await adminEmail();
  if (!email) return { ok: false, error: "Tu sesión expiró. Volvé a entrar." };

  const { data, error } = await getAdmin().rpc("qn_set_precios", {
    p_sabor_id: input.saborId,
    p_sin_factura: input.sinFactura,
    p_con_factura: input.conFactura,
    p_prov_sin: input.provSinFactura,
    p_prov_con: input.provConFactura,
  });
  if (error) return { ok: false, error: clean(error.message) };
  const r = data as { ok?: boolean; error?: string } | null;
  if (!r?.ok) return { ok: false, error: r?.error ?? "No se pudo guardar." };

  revalidatePath("/admin/precios");
  revalidatePath("/admin/venta-fisica");
  return { ok: true, message: "Precios actualizados. El bot ya los usa." };
}

// ── Gastos / Empleados ───────────────────────────────────────────────────────

export async function registrarGasto(input: {
  categoriaId: string;
  descripcion?: string | null;
  monto: number;
  fecha?: string | null;
  nota?: string | null;
}): Promise<ActionResult> {
  if (!isDbConfigured) return { ok: false, error: "Base de datos no configurada." };
  if (!input.categoriaId) return { ok: false, error: "Elegí una categoría." };
  if (!(Number(input.monto) > 0)) return { ok: false, error: "Poné un monto mayor a 0." };
  const email = await adminEmail();
  if (!email) return { ok: false, error: "Tu sesión expiró. Volvé a entrar." };

  const { data, error } = await getAdmin().rpc("qn_registrar_gasto", {
    p_categoria_id: input.categoriaId,
    p_descripcion: input.descripcion?.trim() || null,
    p_monto: input.monto,
    p_fecha: input.fecha || null,
    p_nota: input.nota?.trim() || null,
    p_admin: email,
  });
  if (error) return { ok: false, error: clean(error.message) };
  const r = data as { ok?: boolean; error?: string } | null;
  if (!r?.ok) return { ok: false, error: r?.error ?? "No se pudo registrar." };

  revalidatePath("/admin/gastos");
  revalidatePath("/admin/finanzas");
  return { ok: true, message: "Gasto registrado." };
}

export async function editarGasto(input: {
  id: string;
  categoriaId: string;
  descripcion?: string | null;
  monto: number;
  fecha?: string | null;
  nota?: string | null;
}): Promise<ActionResult> {
  if (!isDbConfigured) return { ok: false, error: "Base de datos no configurada." };
  if (!input.id) return { ok: false, error: "Falta el gasto." };
  if (!(Number(input.monto) > 0)) return { ok: false, error: "Monto inválido." };
  const email = await adminEmail();
  if (!email) return { ok: false, error: "Tu sesión expiró. Volvé a entrar." };

  const { data, error } = await getAdmin().rpc("qn_editar_gasto", {
    p_id: input.id,
    p_categoria_id: input.categoriaId || null,
    p_descripcion: input.descripcion?.trim() || null,
    p_monto: input.monto,
    p_fecha: input.fecha || null,
    p_nota: input.nota?.trim() || null,
  });
  if (error) return { ok: false, error: clean(error.message) };
  const r = data as { ok?: boolean; error?: string } | null;
  if (!r?.ok) return { ok: false, error: r?.error ?? "No se pudo editar." };

  revalidatePath("/admin/gastos");
  revalidatePath("/admin/finanzas");
  return { ok: true, message: "Gasto actualizado." };
}

export async function eliminarGasto(id: string): Promise<ActionResult> {
  if (!isDbConfigured) return { ok: false, error: "Base de datos no configurada." };
  if (!id) return { ok: false, error: "Falta el gasto." };
  const email = await adminEmail();
  if (!email) return { ok: false, error: "Tu sesión expiró. Volvé a entrar." };

  const { data, error } = await getAdmin().rpc("qn_eliminar_gasto", { p_id: id });
  if (error) return { ok: false, error: clean(error.message) };
  const r = data as { ok?: boolean; error?: string } | null;
  if (!r?.ok) return { ok: false, error: r?.error ?? "No se pudo eliminar." };

  revalidatePath("/admin/gastos");
  revalidatePath("/admin/finanzas");
  return { ok: true, message: "Gasto eliminado." };
}

export async function crearCategoriaGasto(nombre: string): Promise<ActionResult> {
  if (!isDbConfigured) return { ok: false, error: "Base de datos no configurada." };
  if (!nombre?.trim()) return { ok: false, error: "Poné un nombre." };
  const email = await adminEmail();
  if (!email) return { ok: false, error: "Tu sesión expiró. Volvé a entrar." };

  const { data, error } = await getAdmin().rpc("qn_crear_categoria_gasto", {
    p_nombre: nombre.trim(),
  });
  if (error) return { ok: false, error: clean(error.message) };
  const r = data as { ok?: boolean; error?: string } | null;
  if (!r?.ok) return { ok: false, error: r?.error ?? "No se pudo crear." };

  revalidatePath("/admin/gastos");
  return { ok: true, message: "Categoría creada." };
}

export async function crearEmpleado(input: {
  nombre: string;
  pagoDia?: number | null;
}): Promise<ActionResult> {
  if (!isDbConfigured) return { ok: false, error: "Base de datos no configurada." };
  if (!input.nombre?.trim()) return { ok: false, error: "Poné el nombre del empleado." };
  const email = await adminEmail();
  if (!email) return { ok: false, error: "Tu sesión expiró. Volvé a entrar." };

  const { data, error } = await getAdmin().rpc("qn_crear_empleado", {
    p_nombre: input.nombre.trim(),
    p_pago_dia: input.pagoDia && input.pagoDia > 0 ? input.pagoDia : null,
  });
  if (error) return { ok: false, error: clean(error.message) };
  const r = data as { ok?: boolean; error?: string } | null;
  if (!r?.ok) return { ok: false, error: r?.error ?? "No se pudo crear." };

  revalidatePath("/admin/gastos");
  return { ok: true, message: "Empleado agregado." };
}

export async function setEmpleadoActivo(input: {
  id: string;
  activo: boolean;
}): Promise<ActionResult> {
  if (!isDbConfigured) return { ok: false, error: "Base de datos no configurada." };
  if (!input.id) return { ok: false, error: "Falta el empleado." };
  const email = await adminEmail();
  if (!email) return { ok: false, error: "Tu sesión expiró. Volvé a entrar." };

  const { data, error } = await getAdmin().rpc("qn_set_empleado_activo", {
    p_id: input.id,
    p_activo: input.activo,
  });
  if (error) return { ok: false, error: clean(error.message) };
  const r = data as { ok?: boolean; error?: string } | null;
  if (!r?.ok) return { ok: false, error: r?.error ?? "No se pudo actualizar." };

  revalidatePath("/admin/gastos");
  return {
    ok: true,
    message: input.activo ? "Empleado reactivado." : "Empleado marcado como inactivo.",
  };
}

// Registra el jornal de un empleado para un día (solo los días que se trabajó).
export async function pagarJornal(input: {
  empleadoId: string;
  fecha?: string | null;
  monto?: number | null;
}): Promise<ActionResult> {
  if (!isDbConfigured) return { ok: false, error: "Base de datos no configurada." };
  if (!input.empleadoId) return { ok: false, error: "Falta el empleado." };
  const email = await adminEmail();
  if (!email) return { ok: false, error: "Tu sesión expiró. Volvé a entrar." };

  const { data, error } = await getAdmin().rpc("qn_pagar_jornal", {
    p_empleado_id: input.empleadoId,
    p_fecha: input.fecha || null,
    p_monto: input.monto && input.monto > 0 ? input.monto : null,
    p_admin: email,
  });
  if (error) return { ok: false, error: clean(error.message) };
  const r = data as { ok?: boolean; error?: string } | null;
  if (!r?.ok) return { ok: false, error: r?.error ?? "No se pudo registrar el jornal." };

  revalidatePath("/admin/gastos");
  revalidatePath("/admin/finanzas");
  return { ok: true, message: "Jornal registrado." };
}
