"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSql, isDbConfigured } from "./db";

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

async function adminEmail(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.email ?? null;
}

function dbError(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);
  // Mensajes de las RPC (raise exception) ya son claros; recortamos ruido.
  return msg.replace(/^.*?ERROR:\s*/i, "").trim() || "Error en la base de datos.";
}

// Confirma el comprobante → la RPC confirmar_pedido es el ÚNICO punto que baja stock.
export async function confirmarPedido(pedidoId: string): Promise<ActionResult> {
  if (!isDbConfigured) return { ok: false, error: "Base de datos no configurada." };
  if (!pedidoId) return { ok: false, error: "Falta el pedido." };
  const email = await adminEmail();
  if (!email) return { ok: false, error: "Tu sesión expiró. Volvé a entrar." };

  try {
    await getSql()`select quenachos.confirmar_pedido(${pedidoId}::uuid, ${email})`;
  } catch (e) {
    return { ok: false, error: dbError(e) };
  }
  revalidatePath("/admin");
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin/inventario");
  return { ok: true, message: "Pedido confirmado y despachado." };
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

  try {
    await getSql()`
      select quenachos.registrar_produccion(
        ${input.saborId},
        ${input.cantidad},
        ${input.lote?.trim() || null},
        ${input.vencimiento || null}::date,
        ${email}
      )`;
  } catch (e) {
    return { ok: false, error: dbError(e) };
  }
  revalidatePath("/admin");
  revalidatePath("/admin/inventario");
  revalidatePath("/admin/produccion");
  return { ok: true, message: "Producción registrada." };
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

  try {
    await getSql()`
      select quenachos.cerrar_factura(
        ${input.clienteId}::uuid,
        ${input.inicio}::date,
        ${input.fin}::date,
        ${input.fechaPago || null}::date
      )`;
  } catch (e) {
    return { ok: false, error: dbError(e) };
  }
  revalidatePath("/admin/cuentas");
  return { ok: true, message: "Factura cerrada." };
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

  try {
    await getSql()`
      select quenachos.pagar_factura(
        ${input.facturaId}::uuid, ${email}, ${input.comprobantePath || null}
      )`;
  } catch (e) {
    return { ok: false, error: dbError(e) };
  }
  revalidatePath("/admin/cuentas");
  return { ok: true, message: "Pago confirmado." };
}
