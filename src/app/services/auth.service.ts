import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthRequestDTO, AuthResponseDTO, UsuarioActual } from '../models/auth.model';
import { UsuarioRegistroDTO } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8081/api';

  private usuarioActualSubject = new BehaviorSubject<UsuarioActual | null>(null);
  public usuarioActual$ = this.usuarioActualSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.cargarUsuarioGuardado();
  }

  login(email: string, contrasena: string): Observable<AuthResponseDTO> {
    const request: AuthRequestDTO = { email, contrasena };

    return this.http.post<AuthResponseDTO>(
      `${this.apiUrl}/authenticate`,
      request,
      { observe: 'response' }
    ).pipe(
      map(response => {
        const body = response.body!;
        const token = response.headers.get('Authorization') || body.jwt;

        const usuario: UsuarioActual = {
          idusuario: body.idusuario,
          email: email,
          roles: Array.from(body.roles),
          token: token
        };

        localStorage.setItem('token', token);
        localStorage.setItem('usuario', JSON.stringify(usuario));

        this.usuarioActualSubject.next(usuario);

        return body;
      })
    );
  }

  registrar(datos: UsuarioRegistroDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}/usuarios`, datos);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');

    this.usuarioActualSubject.next(null);

    this.router.navigate(['/login']);
  }


  estaAutenticado(): boolean {
    const token = this.obtenerToken();
    return !!token;
  }

  obtenerToken(): string | null {
    return localStorage.getItem('token');
  }

  obtenerUsuario(): UsuarioActual | null {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  }


  tieneRol(rol: string): boolean {
    const usuario = this.obtenerUsuario();
    return usuario ? usuario.roles.includes(rol) : false;
  }


  esAdmin(): boolean {
    return this.tieneRol('ROLE_ADMIN');
  }


  private cargarUsuarioGuardado(): void {
    const usuario = this.obtenerUsuario();
    const token = this.obtenerToken();

    if (usuario && token) {
      this.usuarioActualSubject.next(usuario);
    }
  }
}
