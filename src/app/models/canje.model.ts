import {UsuarioDTO} from './usuario.model';

export interface ProductoDTO {
  id?: number;
  nombre: string;
  fecha: string;
  descripcion: string;
  puntosrequerido: number;
  stock: number;
  precioReferencia?: number;
  categoria?: string;
  imagen?: string;
  estado: string;
}

export interface CanjeUsuarioDTO {
  id?: number;
  idUsuario: number;
  idProducto: number;
  fechacanje: string;
  cantidad: number;
  estadoCanje?: string;
  metodoEntrega?: string;
  observaciones?: string;
  direccionEntrega?: string;
  ciudad?: string;
  codigoPostal?: string;
  telefono?: string;
  referencia?: string;
  usuario?: UsuarioDTO;
  producto?: ProductoDTO;
}

export interface NotificacionDTO {
  id?: number;
  idUsuario: number;
  titulo: string;
  mensaje: string;
  tipo: string;
  idReferencia?: number;
  leida: boolean;
  fecha: string;
  icono?: string;
}

export interface BeneficiosUsuarioDTO {
  plan: string;
  multiplicadorPuntos: number;
  descuentoCanjes: number;
}
