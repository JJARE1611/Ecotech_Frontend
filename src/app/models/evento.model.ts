import {UsuarioDTO} from './usuario.model';

export interface EventoDTO {
  id?: number;
  nombre: string;
  descripcion: string;
  fecha: string;
  lugar: string;
  puntos: number;
  capacidadMaxima?: number;
  estadoEvento: string;
  categoria?: string;
  imagenBanner?: string;
  tipoEvento?: string;
  horaInicio?: string;
  horaFin?: string;
}

export interface CrearEventoDTO {
  nombre: string;
  descripcion: string;
  fecha: string;
  lugar: string;
  puntos: number;
  capacidadMaxima?: number;
  estadoEvento?: string;
  categoria?: string;
  imagenBanner?: string;
  tipoEvento?: string;
  horaInicio?: string;
  horaFin?: string;
}

export interface UsuarioEventoDTO {
  id?: number;
  idevento: number;
  idusuario: number;
  fechainscripcion: string;
  asistio: boolean;
  puntosotorgados: number;
  evento?: EventoDTO;
  usuario?: UsuarioDTO;
}

export interface InscripcionEventoDTO {
  idevento: number;
  idusuario: number;
  fechainscripcion: string;
  asistio: boolean;
  puntosotorgados: number;
}
