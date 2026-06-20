export type SaborStock = {
  id: string;
  nombre: string;
  stockActual: number;
  stockMinimo: number;
  bajoMinimo: boolean;
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

export type PedidoAdmin = {
  id: string;
  cliente: string | null;
  telefono: string | null;
  totalBs: number;
  modalidadPago: string;
  origen: string;
  estado: string;
  comprobantePath: string | null;
  createdAt: string;
  items: PedidoItem[];
};

export type CuentaCorriente = {
  clienteId: string;
  nombre: string | null;
  razonSocial: string | null;
  saldoPendienteBs: number;
  ciclo: string;
  diaCorte: number;
};

export type FacturaAdmin = {
  id: string;
  cliente: string | null;
  periodoInicio: string;
  periodoFin: string;
  totalBs: number;
  estado: string;
  fechaPagoLimite: string | null;
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
