// services/notificacion.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { NotificacionDTO } from '../models/canje.model';

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  private apiUrl = 'http://localhost:8081/api';

  // 🔔 Subject para actualizar el contador en tiempo real
  private contadorNotificaciones$ = new Subject<number>();

  constructor(private http: HttpClient) {}

  getContadorNotificaciones(): Observable<number> {
    return this.contadorNotificaciones$.asObservable();
  }


  obtenerNotificaciones(idUsuario: number): Observable<NotificacionDTO[]> {
    return this.http.get<NotificacionDTO[]>(`${this.apiUrl}/usuarios/${idUsuario}/notificaciones`);
  }

  obtenerNotificacionesNoLeidas(idUsuario: number): Observable<NotificacionDTO[]> {
    return this.http.get<NotificacionDTO[]>(`${this.apiUrl}/usuarios/${idUsuario}/notificaciones/no-leidas`);
  }


  contarNotificacionesNoLeidas(idUsuario: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/usuarios/${idUsuario}/notificaciones/contador`)
      .pipe(
        tap(contador => this.contadorNotificaciones$.next(contador))
      );
  }


  marcarComoLeida(idNotificacion: number): Observable<NotificacionDTO> {
    return this.http.put<NotificacionDTO>(`${this.apiUrl}/notificaciones/${idNotificacion}/marcar-leida`, {});
  }


  marcarTodasComoLeidas(idUsuario: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/usuarios/${idUsuario}/notificaciones/marcar-todas-leidas`, {});
  }


  eliminarNotificacion(idNotificacion: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/notificaciones/${idNotificacion}`);
  }


  actualizarContador(contador: number): void {
    this.contadorNotificaciones$.next(contador);
  }
}
