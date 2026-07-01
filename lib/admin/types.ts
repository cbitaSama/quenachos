export type SaborStock = {
  id: string;
  nombre: string;
  stockActual: number;
};

export type PorSabor = {
  id: string;
  nombre: string;
  producido: number;
  despachado: number;
};

export type LoteAlerta = {
  sabor: string;
  saborId: string;
  lote: string | null;
  vencimiento: string;
  cantidad: number;
};

export type PedidoItem = {
  sabor: string;
  cantidad: number;
  precioUnit?: number; // Bs por bolsa (para el desglose transparente)
  subtotal?: number; // cantidad × precioUnit
};

export type SaborPrecio = {
  id: string;
  nombre: string;
  precio: number; // cliente normal CON factura (precio de lista)
  precioSinFactura: number; // cliente normal SIN factura
  precioProveedor: number; // proveedor SIN factura (>=25 bolsas)
  precioProveedorFactura: number; // proveedor CON factura (>=25 bolsas)
};

// Fila del editor de precios (4 tiers por sabor, editables por el dueño).
export type PrecioRow = {
  id: string;
  nombre: string;
  precioSinFactura: number; // cliente normal SIN factura
  precioConFactura: number; // cliente normal CON factura
  precioProvSinFactura: number; // proveedor SIN factura (>=25)
  precioProvConFactura: number; // proveedor CON factura (>=25)
};

// ── Gastos / Empleados / Finanzas ───────────────────────────────────────────

export type CategoriaGasto = {
  id: string;
  nombre: string;
  esSistema: boolean;
};

export type EmpleadoRow = {
  id: string;
  nombre: string;
  pagoDiaBs: number | null;
  activo: boolean;
  pagadoMesBs: number; // total pagado en el mes actual
  diasMes: number; // jornales registrados este mes
};

export type GastoRow = {
  id: string;
  fecha: string;
  categoria: string;
  categoriaId: string;
  empleado: string | null;
  empleadoId: string | null;
  descripcion: string | null;
  montoBs: number;
  nota: string | null;
};

export type FinanzasBucket = {
  inicio: string;
  fin: string;
  ingresos: number;
  egresos: number;
  neto: number;
};

export type FinanzasData = {
  modo: string; // 'mensual' | 'trimestral' | 'semestral' | 'anual'
  buckets: FinanzasBucket[];
  porCategoria: { categoria: string; total: number }[];
  totales: { ingresos: number; egresos: number; neto: number };
};

// Cuenta de proveedor a la que se le puede cargar una venta directa como deuda.
export type CuentaVentaOption = {
  clienteId: string;
  nombre: string;
  nit: string | null; // con NIT => factura por defecto
};

export type VentaFisicaRow = {
  id: string;
  totalBs: number;
  createdAt: string;
  nota: string | null;
  items: PedidoItem[];
};

export type PedidoAdmin = {
  id: string;
  cliente: string | null;
  telefono: string | null;
  totalBs: number;
  modalidadPago: string;
  origen: string;
  estado: string;
  comprobantePath: string | null;
  comprobanteUrl?: string | null;
  createdAt: string;
  direccionTexto: string | null;
  gpsUrl: string | null;
  entregaNota: string | null;
  items: PedidoItem[];
};

export type Contacto = {
  id: string;
  nombre: string;
  telefono: string;
};

export type FacturaAbierta = {
  id: string;
  totalBs: number;
  estado: string;
  comprobantePath: string | null;
  comprobanteUrl?: string | null;
  fechaPagoLimite: string | null;
};

export type CuentaCorriente = {
  clienteId: string;
  nombre: string | null;
  razonSocial: string | null;
  nit: string | null;
  saldoPendienteBs: number;
  consumoCicloBs: number;
  pedidosSinFacturar: number;
  totalAdeudadoBs: number;
  ciclo: string; // 'mensual' | 'trimestral' | 'dias' | 'consignacion'
  diaCorte: number;
  cadaDias: number | null; // periodo en días cuando ciclo === 'dias'
  proximoCorte: string | null; // fecha ISO del próximo corte (solo ciclo 'dias' con consumo)
  venceHoy: boolean;
  diasParaCorte: number | null; // null en 'consignacion' o 'dias' sin consumo
  direccionEntrega: string | null;
  gpsEntrega: string | null;
  facturaAbierta: FacturaAbierta | null;
  contactos: Contacto[];
};

export type FacturaAdmin = {
  id: string;
  clienteId: string | null;
  cliente: string | null;
  periodoInicio: string;
  periodoFin: string;
  totalBs: number;
  estado: string;
  fechaPagoLimite: string | null;
  comprobantePath: string | null;
  comprobanteUrl?: string | null;
};

export type AtencionRow = {
  id: string;
  telefono: string;
  nombre: string | null;
  motivo: string;
  detalle: string | null;
  estado: string;
  createdAt: string;
};

export type MovimientoAdmin = {
  id: string;
  sabor: string;
  tipo: string;
  cantidad: number;
  lote: string | null;
  vencimiento: string | null;
  createdAt: string;
  creadoPor: string | null;
};

export type DashboardData = {
  configured: boolean;
  fechaLegible: string;
  ventasBs: number;
  ventasPedidos: number;
  unidadesVendidas: number;
  producidoHoy: number;
  despachadoHoy: number;
  porSabor: PorSabor[];
  stock: SaborStock[];
  pedidosPorConfirmar: PedidoAdmin[];
  lotesAlerta: LoteAlerta[];
};
