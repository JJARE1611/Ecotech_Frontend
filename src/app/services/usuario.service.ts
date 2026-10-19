import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, Subject} from 'rxjs';
import { tap } from 'rxjs/operators';
import {ActualizarPerfilDTO, CambiarContrasenaDTO, UsuarioDTO} from '../models/usuario.model';
import {SuscripcionDTO} from '../models/suscripcion.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = 'http://localhost:8081/api/usuarios';

  private perfilActualizadoSource = new Subject<UsuarioDTO>();
  perfilActualizado$ = this.perfilActualizadoSource.asObservable();

  constructor(private http: HttpClient) {}


  obtenerPerfil(id: number): Observable<UsuarioDTO> {
    return this.http.get<UsuarioDTO>(`${this.apiUrl}/${id}`);
  }


  obtenerPerfilPorEmail(email: string): Observable<UsuarioDTO> {
    return this.http.get<UsuarioDTO>(`${this.apiUrl}/email/${email}`);
  }


  actualizarPerfil(id: number, datos: ActualizarPerfilDTO): Observable<UsuarioDTO> {
    return this.http.put<UsuarioDTO>(`${this.apiUrl}/${id}`, datos).pipe(
      tap(usuario => {
        console.log('✅ Perfil actualizado:', usuario);
        this.perfilActualizadoSource.next(usuario);
      })
    );
  }


  cambiarContrasena(id: number, datos: CambiarContrasenaDTO): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/cambiar-contrasena`, datos);
  }


  eliminarCuenta(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }


  listarUsuarios(): Observable<UsuarioDTO[]> {
    return this.http.get<UsuarioDTO[]>(`${this.apiUrl}`);
  }





}
