import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FeedbackDTO, CrearFeedbackDTO } from '../models/feedback.model';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private apiUrl = 'http://localhost:8081/api';

  constructor(private http: HttpClient) {}


  crearFeedback(feedback: CrearFeedbackDTO): Observable<FeedbackDTO> {
    return this.http.post<FeedbackDTO>(`${this.apiUrl}/feedbacks`, feedback);
  }

  actualizarFeedback(id: number, feedback: Partial<FeedbackDTO>): Observable<FeedbackDTO> {
    return this.http.put<FeedbackDTO>(`${this.apiUrl}/feedbacks/${id}`, feedback);
  }

  eliminarFeedback(id: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/feedbacks/${id}`);
  }


  validarAsistencia(idUsuario: number, idEvento: number): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.apiUrl}/usuarios/${idUsuario}/eventos/${idEvento}/validar-asistencia`
    );
  }

  listarFeedbacksPorEvento(idEvento: number): Observable<FeedbackDTO[]> {
    return this.http.get<FeedbackDTO[]>(`${this.apiUrl}/eventos/${idEvento}/feedbacks`);
  }

  listarFeedbacksPorUsuario(idUsuario: number): Observable<FeedbackDTO[]> {
    return this.http.get<FeedbackDTO[]>(`${this.apiUrl}/usuarios/${idUsuario}/feedbacks`);
  }


  obtenerPromedioEvento(idEvento: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/eventos/${idEvento}/promedio`);
  }

  buscarPorId(id: number): Observable<FeedbackDTO> {
    return this.http.get<FeedbackDTO>(`${this.apiUrl}/feedbacks/${id}`);
  }

  listarTodos(): Observable<FeedbackDTO[]> {
    return this.http.get<FeedbackDTO[]>(`${this.apiUrl}/feedbacks`);
  }
}
