export interface EstadisticasGenerales {
  totalUsuarios: number;
  totalEventos: number;
  totalDepositos: number;
  totalProductos: number;
  puntosOtorgadosTotal: number;
  puntosCanjeadosTotal: number;
}

export interface DepositoPorTipo {
  tipo: string;
  cantidad: number;
  peso: number;
  puntos: number;
}

export interface EventoParticipacion {
  nombre: string;
  participantes: number;
  fecha: string;
}

export interface UsuarioTop {
  nombre: string;
  apellidos: string;
  email: string;
  puntos: number;
}

export interface DepositoPorMes {
  mes: string;
  cantidad: number;
  peso: number;
}
