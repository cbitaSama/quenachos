"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAdmin, isDbConfigured } from "./db";

export type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string };

async function adminEmail(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.email ?? null;
}

function clean(msg: string | undefined): string {
  return (msg ?? "").replace(/^.*?ERROR:\s*/i, "").trim() || "Error en la base de datos.";
}

// Confirma el comprobante → confirmar_pedido es el ÚNICO punto que baja stock.
export async function confirmarPedido(pedidoId: string): Promise<ActionResult> {
  if (!isDbConfigured) return { ok: false, error: "Base de datos no configurada." };
  if (!pedidoId) return { ok: false, error: "Falta el pedido." };
  const email = await adminEmail();
  if (!email) return { ok: false, error: "Tu sesión expiró. Volvé a entrar." };

  const { error } = await getAdmin().rpc("qn_confirmar_pedido", {
    p_pedido_id: pedidoId,
    p_admin: email,
  });
  if (error) return { ok: false, error: clean(error.message) };

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

  const { error } = await getAdmin().rpc("qn_registrar_produccion", {
    p_sabor_id: input.saborId,
    p_cantidad: input.cantidad,
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

// Confirma el PAGO de una factura (cobro consolidado). NO toca inventario.
export async function pagarFactura(input: {
  facturaId: string;
  comprobantePath?: string | null;
}): Promise<ActionResult> {
  if (!isDbConfigured) return { ok: false, error: "Base de datos no configurada." };
  if (!input.facturaId) return { ok: false, error: "Falta la factura." };
  const email = await adminEmail();
  if (!email) return { ok: false, error: "Tu sesión expiró. Volvé a entrar." };

  const { error } = await getAdmin().rpc("qn_pagar_factura", {
    p_factura_id: input.facturaId,
    p_admin: email,
    p_comprobante: input.comprobantePath || null,
  });
  if (error) return { ok: false, error: clean(error.message) };

  revalidatePath("/admin/cuentas");
  return { ok: true, message: "Pago confirmado." };
}
