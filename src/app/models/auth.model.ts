export interface AuthRequestDTO {
  email: string;
  contrasena: string;
}

export interface AuthResponseDTO {
  jwt: string;
  roles: string[];
  idusuario?: number;
}

export interface UsuarioActual {
  idusuario?: number;
  email: string;
  roles: string[];
  token: string;
}
