import {UsuarioDTO} from './usuario.model';

export interface DepositoDTO {
  id?: number;
  idUsuario: number;
  ubicacion: string;
  fechaenvio: string;
  descripcion: string;
  tiporesiduo: string;
  ubicaciondeposito: string;
  pruebas: string;
  cantidad: number;
  puntosotorgados: number;
  estado: string;
  usuario?: UsuarioDTO;
}

export interface TipoResiduo {
  id: string;
  nombre: string;
  puntosPorKg: number;
  icono: string;
  ejemplos: string;
}
