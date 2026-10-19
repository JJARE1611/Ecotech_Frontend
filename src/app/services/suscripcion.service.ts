import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SuscripcionDTO, MetodoPagoDTO, BeneficiosDTO, CambiarPlanDTO } from '../models/suscripcion.model';

@Injectable({
  providedIn: 'root'
})
export class SuscripcionService {
  private apiUrl = 'http://localhost:8081/api';

  constructor(private http: HttpClient) {
  }

  crearSuscripcion(suscripcion: SuscripcionDTO): Observable<SuscripcionDTO> {
    return this.http.post<SuscripcionDTO>(`${this.apiUrl}/suscripciones`, suscripcion);
  }

  obtenerSuscripcionActual(idUsuario: number): Observable<SuscripcionDTO> {
    return this.http.get<SuscripcionDTO>(
      `${this.apiUrl}/usuarios/${idUsuario}/suscripcion-actual`
    );
  }


  validarSuscripcionActiva(idUsuario: number): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.apiUrl}/usuarios/${idUsuario}/suscripcion-activa`
    );
  }

  obtenerSuscripcionesUsuario(idUsuario: number): Observable<SuscripcionDTO[]> {
    return this.http.get<SuscripcionDTO[]>(
      `${this.apiUrl}/usuarios/${idUsuario}/suscripciones`
    );
  }


  obtenerMultiplicadorPuntos(idUsuario: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/usuarios/${idUsuario}/multiplicador-puntos`);
  }


  cambiarPlan(idUsuario: number, cambio: CambiarPlanDTO): Observable<SuscripcionDTO> {
    return this.http.post<SuscripcionDTO>(`${this.apiUrl}/usuarios/${idUsuario}/cambiar-plan`, cambio);
  }


  renovarSuscripcion(idSuscripcion: number, nuevoPlan: string): Observable<SuscripcionDTO> {
    return this.http.put<SuscripcionDTO>(
      `${this.apiUrl}/suscripciones/${idSuscripcion}/renovar`,
      {nuevoPlan}
    );
  }


  actualizarEstado(idSuscripcion: number, nuevoEstado: string): Observable<SuscripcionDTO> {
    return this.http.put<SuscripcionDTO>(
      `${this.apiUrl}/suscripciones/${idSuscripcion}/estado`,
      {estado: nuevoEstado}
    );
  }


  listarPlanes(): Observable<BeneficiosDTO[]> {
    return this.http.get<BeneficiosDTO[]>(`${this.apiUrl}/planes`);
  }


  obtenerBeneficios(tipoplan: string): Observable<BeneficiosDTO> {
    return this.http.get<BeneficiosDTO>(`${this.apiUrl}/planes/${tipoplan}/beneficios`);
  }


  listarMetodosPago(): Observable<MetodoPagoDTO[]> {
    return this.http.get<MetodoPagoDTO[]>(`${this.apiUrl}/metodos-pago`);
  }


  cancelarCambioProgramado(idSuscripcion: number): Observable<SuscripcionDTO> {
    return this.http.put<SuscripcionDTO>(
      `${this.apiUrl}/suscripciones/${idSuscripcion}/cancelar-cambio`,
      {}
    );
  }


  cancelarSuscripcion(id: number): Observable<SuscripcionDTO> {
    return this.http.put<SuscripcionDTO>(
      `${this.apiUrl}/suscripciones/${id}/cancelar`,
      {}
    );
  }


}
