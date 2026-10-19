import {UsuarioDTO} from './usuario.model';
import {EventoDTO} from './evento.model';

export interface FeedbackDTO {
  id?: number;
  idEvento: number;
  idUsuario: number;
  comentario: string;
  fecha?: string;
  puntuacion: number;
  usuario?: UsuarioDTO
  evento?: EventoDTO
}

export interface CrearFeedbackDTO {
  idEvento: number;
  idUsuario: number;
  comentario: string;
  puntuacion: number;
}
