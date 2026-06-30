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

export type PedidoItem = { sabor: string; cantidad: number };

export type SaborPrecio = {
  id: string;
  nombre: string;
  precio: number; // precio normal (cliente)
  precioProveedor: number; // proveedor SIN factura (>=25 bolsas)
  precioProveedorFactura: number; // proveedor CON factura (>=25 bolsas)
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
  ciclo: string;
  diaCorte: number;
  venceHoy: boolean;
  diasParaCorte: number;
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
