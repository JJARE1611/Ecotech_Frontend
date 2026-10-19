export interface SuscripcionDTO {
  id?: number;
  idusuario: number;
  idmetodopago: number;
  tipoplan: string;
  fechainicio: string;
  fechafin: string;
  descripcion: string;
  estado: string;
  monto?: number;
  proximoPlan?: string;
  descuentoCanje?: number;
  accesoEventosVIP?: boolean;
  prioridadEventos?: boolean;
  contenidoExclusivo?: boolean;
  multiplicadorPuntos?: number;
  diasRestantes?: number;
}

export interface MetodoPagoDTO {
  id?: number;
  tipo: string;
  numero: string;
  titular: string;
}

export interface PlanInfo {
  nombre: string;
  precio: number;
  multiplicador: number;
  duracion: string;
  beneficios: string[];
  color: string;
  descuentoCanje: number;
  accesoEventosVIP: boolean;
  prioridadEventos: boolean;
  contenidoExclusivo: boolean;
  icono: string;
}

export interface BeneficiosDTO {
  tipoplan: string;
  multiplicadorPuntos: number;
  descuentoCanje: number;
  accesoEventosVIP: boolean;
  prioridadEventos: boolean;
  contenidoExclusivo: boolean;
  descripcionBeneficios: string;
}

export interface CambiarPlanDTO {
  nuevoPlan: string;
  idMetodoPago: number;
}
