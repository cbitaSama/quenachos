import { getSql, isDbConfigured } from "./db";
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

const HOY_LAPAZ = `(now() at time zone 'America/La_Paz')::date`;
const FECHA_LAPAZ = (col: string) =>
  `(${col} at time zone 'America/La_Paz')::date`;

function fechaLegible(): string {
  return new Date().toLocaleDateString("es-BO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export async function getDashboard(): Promise<DashboardData> {
  if (!isDbConfigured) {
    return {
      configured: false,
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
  }

  const sql = getSql();

  const [ventas, unidades, porSaborRows, stockRows, lotes, pedidos] =
    await Promise.all([
      sql<{ bs: number; pedidos: number }[]>`
        select coalesce(sum(total_bs),0)::float as bs, count(*)::int as pedidos
        from quenachos.pedidos
        where estado in ('confirmado','despachado')
          and ${sql.unsafe(FECHA_LAPAZ("created_at"))} = ${sql.unsafe(HOY_LAPAZ)}`,
      sql<{ unidades: number }[]>`
        select coalesce(sum(ip.cantidad),0)::int as unidades
        from quenachos.items_pedido ip
        join quenachos.pedidos p on p.id = ip.pedido_id
        where p.estado in ('confirmado','despachado')
          and ${sql.unsafe(FECHA_LAPAZ("p.created_at"))} = ${sql.unsafe(HOY_LAPAZ)}`,
      sql<PorSabor[]>`
        select s.id, s.nombre,
          coalesce(sum(case when m.tipo='produccion' then m.cantidad else 0 end),0)::int as producido,
          coalesce(sum(case when m.tipo='despacho' then -m.cantidad else 0 end),0)::int as despachado
        from quenachos.sabores s
        left join quenachos.movimientos_inventario m
          on m.sabor_id = s.id
          and ${sql.unsafe(FECHA_LAPAZ("m.created_at"))} = ${sql.unsafe(HOY_LAPAZ)}
        where s.activo
        group by s.id, s.nombre, s.orden
        order by s.orden`,
      sql<
        {
          id: string;
          nombre: string;
          stock_actual: number;
          stock_minimo: number;
          bajo_minimo: boolean;
        }[]
      >`
        select s.id, s.nombre, i.stock_actual, i.stock_minimo,
          (i.stock_actual <= i.stock_minimo) as bajo_minimo
        from quenachos.inventario i
        join quenachos.sabores s on s.id = i.sabor_id
        where s.activo
        order by s.orden`,
      sql<LoteAlerta[]>`
        select s.nombre as sabor, m.sabor_id as "saborId", m.lote,
          m.vencimiento::text as vencimiento, m.cantidad::int as cantidad
        from quenachos.movimientos_inventario m
        join quenachos.sabores s on s.id = m.sabor_id
        where m.tipo='produccion' and m.vencimiento is not null
          and m.vencimiento <= ${sql.unsafe(HOY_LAPAZ)} + 30
        order by m.vencimiento asc`,
      getPedidosPorConfirmar(),
    ]);

  const stock: SaborStock[] = stockRows.map((r) => ({
    id: r.id,
    nombre: r.nombre,
    stockActual: r.stock_actual,
    stockMinimo: r.stock_minimo,
    bajoMinimo: r.bajo_minimo,
  }));

  return {
    configured: true,
    fechaLegible: fechaLegible(),
    ventasBs: ventas[0]?.bs ?? 0,
    ventasPedidos: ventas[0]?.pedidos ?? 0,
    unidadesVendidas: unidades[0]?.unidades ?? 0,
    producidoHoy: porSaborRows.reduce((s, r) => s + r.producido, 0),
    despachadoHoy: porSaborRows.reduce((s, r) => s + r.despachado, 0),
    porSabor: porSaborRows,
    stock,
    pedidosPorConfirmar: pedidos,
    lotesAlerta: lotes,
  };
}

export async function getPedidosPorConfirmar(): Promise<PedidoAdmin[]> {
  if (!isDbConfigured) return [];
  return getPedidos("comprobante_recibido");
}

export async function getPedidos(estado?: string): Promise<PedidoAdmin[]> {
  if (!isDbConfigured) return [];
  const sql = getSql();
  const rows = await sql<
    {
      id: string;
      cliente: string | null;
      telefono: string | null;
      total_bs: number;
      modalidad_pago: string;
      origen: string;
      estado: string;
      comprobante_path: string | null;
      created_at: string;
      items: { sabor: string; cantidad: number }[];
    }[]
  >`
    select p.id, c.nombre as cliente, c.telefono,
      p.total_bs::float as total_bs, p.modalidad_pago, p.origen, p.estado,
      p.comprobante_path, p.created_at,
      coalesce(
        json_agg(json_build_object('sabor', s.nombre, 'cantidad', ip.cantidad))
          filter (where ip.id is not null), '[]'
      ) as items
    from quenachos.pedidos p
    left join quenachos.clientes c on c.id = p.cliente_id
    left join quenachos.items_pedido ip on ip.pedido_id = p.id
    left join quenachos.sabores s on s.id = ip.sabor_id
    ${estado ? sql`where p.estado = ${estado}` : sql``}
    group by p.id, c.nombre, c.telefono
    order by p.created_at desc
    limit 200`;
  return rows.map((r) => ({
    id: r.id,
    cliente: r.cliente,
    telefono: r.telefono,
    totalBs: r.total_bs,
    modalidadPago: r.modalidad_pago,
    origen: r.origen,
    estado: r.estado,
    comprobantePath: r.comprobante_path,
    createdAt: r.created_at,
    items: r.items ?? [],
  }));
}

export async function getInventario(): Promise<{
  stock: SaborStock[];
  lotes: LoteAlerta[];
}> {
  if (!isDbConfigured) return { stock: [], lotes: [] };
  const sql = getSql();
  const [stockRows, lotes] = await Promise.all([
    sql<
      {
        id: string;
        nombre: string;
        stock_actual: number;
        stock_minimo: number;
        bajo_minimo: boolean;
      }[]
    >`
      select s.id, s.nombre, i.stock_actual, i.stock_minimo,
        (i.stock_actual <= i.stock_minimo) as bajo_minimo
      from quenachos.inventario i
      join quenachos.sabores s on s.id = i.sabor_id
      where s.activo order by s.orden`,
    sql<LoteAlerta[]>`
      select s.nombre as sabor, m.sabor_id as "saborId", m.lote,
        m.vencimiento::text as vencimiento, m.cantidad::int as cantidad
      from quenachos.movimientos_inventario m
      join quenachos.sabores s on s.id = m.sabor_id
      where m.tipo='produccion' and m.vencimiento is not null
      order by m.vencimiento asc
      limit 100`,
  ]);
  return {
    stock: stockRows.map((r) => ({
      id: r.id,
      nombre: r.nombre,
      stockActual: r.stock_actual,
      stockMinimo: r.stock_minimo,
      bajoMinimo: r.bajo_minimo,
    })),
    lotes,
  };
}

export async function getSaboresActivos(): Promise<
  { id: string; nombre: string }[]
> {
  if (!isDbConfigured) return [];
  const sql = getSql();
  return sql<{ id: string; nombre: string }[]>`
    select id, nombre from quenachos.sabores where activo order by orden`;
}

export async function getMovimientos(
  tipo?: string,
): Promise<MovimientoAdmin[]> {
  if (!isDbConfigured) return [];
  const sql = getSql();
  const rows = await sql<
    {
      id: string;
      sabor: string;
      tipo: string;
      cantidad: number;
      lote: string | null;
      vencimiento: string | null;
      created_at: string;
      creado_por: string | null;
    }[]
  >`
    select m.id, s.nombre as sabor, m.tipo, m.cantidad::int as cantidad,
      m.lote, m.vencimiento::text as vencimiento, m.created_at, m.creado_por
    from quenachos.movimientos_inventario m
    join quenachos.sabores s on s.id = m.sabor_id
    ${tipo ? sql`where m.tipo = ${tipo}` : sql``}
    order by m.created_at desc
    limit 60`;
  return rows.map((r) => ({
    id: r.id,
    sabor: r.sabor,
    tipo: r.tipo,
    cantidad: r.cantidad,
    lote: r.lote,
    vencimiento: r.vencimiento,
    createdAt: r.created_at,
    creadoPor: r.creado_por,
  }));
}

export async function getCuentasPorCobrar(): Promise<CuentaCorriente[]> {
  if (!isDbConfigured) return [];
  const sql = getSql();
  const rows = await sql<
    {
      cliente_id: string;
      nombre: string | null;
      razon_social: string | null;
      saldo: number;
      ciclo: string;
      dia_corte: number;
    }[]
  >`
    select c.id as cliente_id, c.nombre, ci.razon_social,
      ci.saldo_pendiente_bs::float as saldo, ci.ciclo_facturacion as ciclo, ci.dia_corte
    from quenachos.clientes_institucionales ci
    join quenachos.clientes c on c.id = ci.cliente_id
    where ci.activo
    order by ci.saldo_pendiente_bs desc`;
  return rows.map((r) => ({
    clienteId: r.cliente_id,
    nombre: r.nombre,
    razonSocial: r.razon_social,
    saldoPendienteBs: r.saldo,
    ciclo: r.ciclo,
    diaCorte: r.dia_corte,
  }));
}

export async function getFacturas(): Promise<FacturaAdmin[]> {
  if (!isDbConfigured) return [];
  const sql = getSql();
  const rows = await sql<
    {
      id: string;
      cliente: string | null;
      periodo_inicio: string;
      periodo_fin: string;
      total_bs: number;
      estado: string;
      fecha_pago_limite: string | null;
    }[]
  >`
    select f.id, c.nombre as cliente,
      f.periodo_inicio::text, f.periodo_fin::text,
      f.total_bs::float as total_bs, f.estado,
      f.fecha_pago_limite::text as fecha_pago_limite
    from quenachos.facturas f
    join quenachos.clientes c on c.id = f.cliente_id
    order by f.emitida_at desc
    limit 100`;
  return rows.map((r) => ({
    id: r.id,
    cliente: r.cliente,
    periodoInicio: r.periodo_inicio,
    periodoFin: r.periodo_fin,
    totalBs: r.total_bs,
    estado: r.estado,
    fechaPagoLimite: r.fecha_pago_limite,
  }));
}
