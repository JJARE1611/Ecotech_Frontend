export interface UsuarioDTO {
  id?: number;
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  direccion: string;
  contrasena?: string;
  fotoPerfil?: string;
}

export interface UsuarioRegistroDTO {
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  direccion: string;
  contrasena: string;
}

export interface ActualizarPerfilDTO {
  nombre: string;
  apellidos: string;
  telefono: string;
  direccion: string;
  fotoPerfil?: string;
}

export interface CambiarContrasenaDTO {
  contrasenaActual: string;
  contrasenaNueva: string;
}

