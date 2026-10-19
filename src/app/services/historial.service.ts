import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HistorialPuntosDTO, ResumenPuntos } from '../models/historial.model';

@Injectable({
  providedIn: 'root'
})
export class HistorialService {
  private apiUrl = 'http://localhost:8081/api';

  constructor(private http: HttpClient) {}


  obtenerHistorialUsuario(idUsuario: number): Observable<HistorialPuntosDTO[]> {
    return this.http.get<HistorialPuntosDTO[]>(
      `${this.apiUrl}/usuarios/${idUsuario}/historial-puntos`
    );
  }

  obtenerHistorialPorTipo(idUsuario: number, tipo: string): Observable<HistorialPuntosDTO[]> {
    return this.http.get<HistorialPuntosDTO[]>(
      `${this.apiUrl}/usuarios/${idUsuario}/historial-puntos/tipo/${tipo}`
    );
  }

  obtenerPuntosDisponibles(idUsuario: number): Observable<number> {
    return this.http.get<number>(
      `${this.apiUrl}/usuarios/${idUsuario}/puntos-disponibles`
    );
  }

  obtenerHistorialPorFechas(
    idUsuario: number,
    inicio: string,
    fin: string
  ): Observable<HistorialPuntosDTO[]> {
    const params = new HttpParams()
      .set('inicio', inicio)
      .set('fin', fin);

    return this.http.get<HistorialPuntosDTO[]>(
      `${this.apiUrl}/usuarios/${idUsuario}/historial-puntos/rango`,
      { params }
    );
  }
}
