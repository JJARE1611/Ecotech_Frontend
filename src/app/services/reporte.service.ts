import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  EstadisticasGenerales,
  DepositoPorTipo,
  EventoParticipacion,
  UsuarioTop,
  DepositoPorMes
} from '../models/reporte.model';

@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  private apiUrl = 'http://localhost:8081/api/reportes';

  constructor(private http: HttpClient) {}

  obtenerEstadisticasGenerales(): Observable<EstadisticasGenerales> {
    return this.http.get<EstadisticasGenerales>(`${this.apiUrl}/estadisticas-generales`);
  }

  obtenerDepositosPorTipo(inicio: string, fin: string): Observable<DepositoPorTipo[]> {
    const params = new HttpParams()
      .set('inicio', inicio)
      .set('fin', fin);
    return this.http.get<DepositoPorTipo[]>(`${this.apiUrl}/depositos-por-tipo`, { params });
  }

  obtenerEventosMasParticipados(limite: number): Observable<EventoParticipacion[]> {
    return this.http.get<EventoParticipacion[]>(`${this.apiUrl}/eventos-mas-participados`, {
      params: { limite: limite.toString() }
    });
  }

  obtenerUsuariosTop(limite: number): Observable<UsuarioTop[]> {
    return this.http.get<UsuarioTop[]>(`${this.apiUrl}/usuarios-top`, {
      params: { limite: limite.toString() }
    });
  }

  obtenerDepositosPorMes(inicio: string, fin: string): Observable<DepositoPorMes[]> {
    const params = new HttpParams()
      .set('inicio', inicio)
      .set('fin', fin);
    return this.http.get<DepositoPorMes[]>(`${this.apiUrl}/depositos-por-mes`, { params });
  }


}
