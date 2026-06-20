import { getAdmin, isDbConfigured } from "./db";
import type {
  CuentaCorriente,
  DashboardData,
  FacturaAdmin,
  LoteAlerta,
  MovimientoAdmin,
  PedidoAdmin,
  PorSabor,
  SaborStock,
} from "./types";

function fechaLegible(): string {
  return new Date().toLocaleDateString("es-BO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

async function rpc<T>(fn: string, args?: Record<string, unknown>): Promise<T | null> {
  if (!isDbConfigured) return null;
  const { data, error } = await getAdmin().rpc(fn, args);
  if (error) {
    console.error(`[admin] ${fn}:`, error.message);
    return null;
  }
  return data as T;
}

export async function getDashboard(): Promise<DashboardData> {
  const empty: DashboardData = {
    configured: isDbConfigured,
    fechaLegible: fechaLegible(),
    ventasBs: 0,
    ventasPedidos: 0,
    unidadesVendidas: 0,
    producidoHoy: 0,
    despachadoHoy: 0,
    porSabor: [],
    stock: [],
    pedidosPorConfirmar: [],
    lotesAlerta: [],
  };

  const d = await rpc<{
    ventas: { bs: number; pedidos: number };
    unidades: number;
    porSabor: PorSabor[];
    stock: SaborStock[];
    lotesAlerta: LoteAlerta[];
    pedidosPorConfirmar: PedidoAdmin[];
  }>("qn_dashboard");
  if (!d) return empty;

  const porSabor = d.porSabor ?? [];
  return {
    configured: true,
    fechaLegible: fechaLegible(),
    ventasBs: d.ventas?.bs ?? 0,
    ventasPedidos: d.ventas?.pedidos ?? 0,
    unidadesVendidas: d.unidades ?? 0,
    producidoHoy: porSabor.reduce((s, r) => s + (r.producido ?? 0), 0),
    despachadoHoy: porSabor.reduce((s, r) => s + (r.despachado ?? 0), 0),
    porSabor,
    stock: d.stock ?? [],
    pedidosPorConfirmar: d.pedidosPorConfirmar ?? [],
    lotesAlerta: d.lotesAlerta ?? [],
  };
}

export async function getPedidosPorConfirmar(): Promise<PedidoAdmin[]> {
  return getPedidos("comprobante_recibido");
}

export async function getPedidos(estado?: string): Promise<PedidoAdmin[]> {
  const data = await rpc<PedidoAdmin[]>("qn_pedidos", { p_estado: estado ?? null });
  return data ?? [];
}

export async function getInventario(): Promise<{
  stock: SaborStock[];
  lotes: LoteAlerta[];
}> {
  const data = await rpc<{ stock: SaborStock[]; lotes: LoteAlerta[] }>("qn_inventario");
  return data ?? { stock: [], lotes: [] };
}

export async function getSaboresActivos(): Promise<{ id: string; nombre: string }[]> {
  const data = await rpc<{ id: string; nombre: string }[]>("qn_sabores");
  return data ?? [];
}

export async function getMovimientos(tipo?: string): Promise<MovimientoAdmin[]> {
  const data = await rpc<MovimientoAdmin[]>("qn_movimientos", { p_tipo: tipo ?? null });
  return data ?? [];
}

export async function getCuentasPorCobrar(): Promise<CuentaCorriente[]> {
  const data = await rpc<CuentaCorriente[]>("qn_cuentas");
  return data ?? [];
}

export async function getFacturas(): Promise<FacturaAdmin[]> {
  const data = await rpc<FacturaAdmin[]>("qn_facturas");
  return data ?? [];
}
