import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CanjeUsuarioDTO } from '../models/canje.model';

@Injectable({
  providedIn: 'root'
})
export class CanjeService {
  private apiUrl = 'http://localhost:8081/api';

  constructor(private http: HttpClient) {}

  canjearProducto(canje: CanjeUsuarioDTO): Observable<CanjeUsuarioDTO> {
    return this.http.post<CanjeUsuarioDTO>(`${this.apiUrl}/canjes`, canje);
  }

  validarPuntosUsuario(idUsuario: number, idProducto: number, cantidad: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/usuarios/${idUsuario}/validar-puntos`, {
      params: {
        idProducto: idProducto.toString(),
        cantidad: cantidad.toString()
      }
    });
  }

  obtenerPuntosUsuario(idUsuario: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/usuarios/${idUsuario}/puntos`);
  }

  obtenerCanjesUsuario(idUsuario: number): Observable<CanjeUsuarioDTO[]> {
    return this.http.get<CanjeUsuarioDTO[]>(`${this.apiUrl}/usuarios/${idUsuario}/canjes`);
  }

  listarTodosCanjes(): Observable<CanjeUsuarioDTO[]> {
    return this.http.get<CanjeUsuarioDTO[]>(`${this.apiUrl}/canjes`);
  }

  listarCanjesPorEstado(estado: string): Observable<CanjeUsuarioDTO[]> {
    return this.http.get<CanjeUsuarioDTO[]>(`${this.apiUrl}/canjes/estado/${estado}`);
  }


  actualizarEstadoCanje(id: number, nuevoEstado: string): Observable<CanjeUsuarioDTO> {
    return this.http.put<CanjeUsuarioDTO>(`${this.apiUrl}/canjes/${id}/estado`, { estadoCanje: nuevoEstado });
  }

  actualizarMetodoEntrega(id: number, nuevoMetodo: string): Observable<CanjeUsuarioDTO> {
    return this.http.put<CanjeUsuarioDTO>(`${this.apiUrl}/canjes/${id}/metodo-entrega`, { metodoEntrega: nuevoMetodo });
  }

  agregarObservaciones(id: number, observaciones: string): Observable<CanjeUsuarioDTO> {
    return this.http.put<CanjeUsuarioDTO>(`${this.apiUrl}/canjes/${id}/observaciones`, { observaciones });
  }

  obtenerCanjePorId(id: number): Observable<CanjeUsuarioDTO> {
    return this.http.get<CanjeUsuarioDTO>(`${this.apiUrl}/canjes/${id}`);
  }

  obtenerBeneficiosUsuario(idUsuario: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/usuarios/${idUsuario}/beneficios`);
  }

  calcularPrecioConDescuento(puntosBase: number, descuento: number): number {
    if (descuento === 0) return puntosBase;
    return Math.ceil(puntosBase * (1 - descuento / 100));
  }


  permiteEntregaDigital(idProducto: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/productos/${idProducto}/permite-entrega-digital`);
  }


}
