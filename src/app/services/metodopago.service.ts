import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MetodoPagoDTO {
  id: number;
  nombremetodo: string;
}

@Injectable({
  providedIn: 'root'
})
export class MetodopagoService {
  private apiUrl = 'http://localhost:8081/api';

  constructor(private http: HttpClient) {}

  listarMetodopagos(): Observable<MetodoPagoDTO[]> {
    return this.http.get<MetodoPagoDTO[]>(`${this.apiUrl}/metodos-pagos`);
  }
}
