import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EventoDTO, CrearEventoDTO, UsuarioEventoDTO, InscripcionEventoDTO } from '../models/evento.model';

@Injectable({
  providedIn: 'root'
})
export class EventoService {
  private apiUrl = 'http://localhost:8081/api';

  constructor(private http: HttpClient) {}


  listarEventos(): Observable<EventoDTO[]> {
    return this.http.get<EventoDTO[]>(`${this.apiUrl}/eventos`);
  }

  obtenerEvento(id: number): Observable<EventoDTO> {
    return this.http.get<EventoDTO>(`${this.apiUrl}/eventos/${id}`);
  }

  crearEvento(evento: CrearEventoDTO): Observable<EventoDTO> {
    return this.http.post<EventoDTO>(`${this.apiUrl}/eventos`, evento);
  }

  actualizarEvento(id: number, evento: CrearEventoDTO): Observable<EventoDTO> {
    return this.http.put<EventoDTO>(`${this.apiUrl}/eventos/${id}`, evento);
  }

  eliminarEvento(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/eventos/${id}`);
  }


  listarEventosProximos(): Observable<EventoDTO[]> {
    return this.http.get<EventoDTO[]>(`${this.apiUrl}/eventos/proximos`);
  }


  listarEventosPasados(): Observable<EventoDTO[]> {
    return this.http.get<EventoDTO[]>(`${this.apiUrl}/eventos/pasados`);
  }


  listarEventosProgramados(): Observable<EventoDTO[]> {
    return this.http.get<EventoDTO[]>(`${this.apiUrl}/eventos/programados`);
  }


  listarEventosEnCurso(): Observable<EventoDTO[]> {
    return this.http.get<EventoDTO[]>(`${this.apiUrl}/eventos/en-curso`);
  }


  listarEventosFinalizados(): Observable<EventoDTO[]> {
    return this.http.get<EventoDTO[]>(`${this.apiUrl}/eventos/finalizados`);
  }


  listarPorCategoria(categoria: string): Observable<EventoDTO[]> {
    return this.http.get<EventoDTO[]>(`${this.apiUrl}/eventos/categoria/${categoria}`);
  }


  listarPorEstado(estadoEvento: string): Observable<EventoDTO[]> {
    return this.http.get<EventoDTO[]>(`${this.apiUrl}/eventos/estado/${estadoEvento}`);
  }

  listarEventosConCapacidad(): Observable<EventoDTO[]> {
    return this.http.get<EventoDTO[]>(`${this.apiUrl}/eventos/con-capacidad`);
  }


  listarCategorias(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/eventos/categorias`);
  }


  filtrarEventos(categoria?: string, estadoEvento?: string): Observable<EventoDTO[]> {
    let params = new HttpParams();
    if (categoria) {
      params = params.set('categoria', categoria);
    }
    if (estadoEvento) {
      params = params.set('estadoEvento', estadoEvento);
    }
    return this.http.get<EventoDTO[]>(`${this.apiUrl}/eventos/filtrar`, { params });
  }


  actualizarEstadoEvento(id: number, nuevoEstado: string): Observable<EventoDTO> {
    return this.http.put<EventoDTO>(`${this.apiUrl}/eventos/${id}/estado`, { estadoEvento: nuevoEstado });
  }


  actualizarCapacidad(id: number, nuevaCapacidad: number): Observable<EventoDTO> {
    return this.http.put<EventoDTO>(`${this.apiUrl}/eventos/${id}/capacidad`, { capacidadMaxima: nuevaCapacidad });
  }


  obtenerCapacidadDisponible(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/eventos/${id}/capacidad-disponible`);
  }


  verificarCapacidad(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/eventos/${id}/tiene-capacidad`);
  }


  inscribirseEvento(inscripcion: InscripcionEventoDTO): Observable<UsuarioEventoDTO> {
    return this.http.post<UsuarioEventoDTO>(`${this.apiUrl}/usuario-eventos`, inscripcion);
  }

  obtenerMisEventos(idUsuario: number): Observable<UsuarioEventoDTO[]> {
    return this.http.get<UsuarioEventoDTO[]>(`${this.apiUrl}/usuarios/${idUsuario}/eventos`);
  }


  verificarInscripcion(idEvento: number, idUsuario: number): Observable<boolean> {
    return new Observable(observer => {
      this.obtenerMisEventos(idUsuario).subscribe({
        next: (inscripciones) => {
          const estaInscrito = inscripciones.some(i => i.idevento === idEvento);
          observer.next(estaInscrito);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }


  obtenerInscritosPorEvento(idEvento: number): Observable<UsuarioEventoDTO[]> {
    return this.http.get<UsuarioEventoDTO[]>(`${this.apiUrl}/eventos/${idEvento}/inscritos`);
  }

  marcarAsistencia(id: number, asistio: boolean): Observable<UsuarioEventoDTO> {
    return this.http.put<UsuarioEventoDTO>(
      `${this.apiUrl}/usuario-eventos/${id}/asistencia?asistio=${asistio}`,
      {}
    );
  }

  obtenerEventosDisponiblesParaUsuario(idUsuario: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usuarios/${idUsuario}/eventos-disponibles`);
  }


  obtenerBeneficiosUsuario(idUsuario: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/usuarios/${idUsuario}/beneficios`);
  }

  cancelarInscripcion(idInscripcion: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/usuario-eventos/${idInscripcion}`);
  }


}
