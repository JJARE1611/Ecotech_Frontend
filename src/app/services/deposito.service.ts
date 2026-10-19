import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DepositoDTO } from '../models/deposito.model';

@Injectable({
  providedIn: 'root'
})
export class DepositoService {
  private apiUrl = 'http://localhost:8081/api';

  constructor(private http: HttpClient) {}

  registrarDeposito(deposito: DepositoDTO): Observable<DepositoDTO> {
    return this.http.post<DepositoDTO>(`${this.apiUrl}/depositos`, deposito);
  }

  listarTodos(): Observable<DepositoDTO[]> {
    return this.http.get<DepositoDTO[]>(`${this.apiUrl}/depositos`);
  }


  obtenerDeposito(id: number): Observable<DepositoDTO> {
    return this.http.get<DepositoDTO>(`${this.apiUrl}/depositos/${id}`);
  }

  obtenerDepositosUsuario(idUsuario: number): Observable<DepositoDTO[]> {
    return this.http.get<DepositoDTO[]>(`${this.apiUrl}/usuarios/${idUsuario}/depositos`);
  }

  actualizarDeposito(id: number, deposito: DepositoDTO): Observable<DepositoDTO> {
    return this.http.put<DepositoDTO>(`${this.apiUrl}/depositos/${id}`, deposito);
  }

  validarDeposito(id: number, aprobado: boolean): Observable<DepositoDTO> {
    return this.http.put<DepositoDTO>(
      `${this.apiUrl}/depositos/${id}/validar?aprobado=${aprobado}`,
      {}
    );
  }
}
