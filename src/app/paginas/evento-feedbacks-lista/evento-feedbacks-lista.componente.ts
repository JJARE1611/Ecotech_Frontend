import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FeedbackService } from '../../services/feedback.service';
import { EventoService } from '../../services/evento.service';
import { FeedbackDTO } from '../../models/feedback.model';
import { EventoDTO } from '../../models/evento.model';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-evento-feedbacks-lista',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatDividerModule
  ],
  templateUrl: './evento-feedbacks-lista.componente.html',
  styleUrls: ['./evento-feedbacks-lista.componente.css']
})
export class EventoFeedbacksListaComponent implements OnInit {
  evento: EventoDTO | null = null;
  feedbacks: FeedbackDTO[] = [];
  promedioCalificacion: number = 0;

  cargando = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private feedbackService: FeedbackService,
    private eventoService: EventoService
  ) {}

  ngOnInit() {
    const idEvento = this.route.snapshot.paramMap.get('id');

    if (idEvento) {
      this.cargarDatos(parseInt(idEvento));
    } else {
      this.error = 'ID de evento inválido';
      this.cargando = false;
    }
  }

  cargarDatos(idEvento: number) {
    this.cargando = true;

    this.eventoService.obtenerEvento(idEvento).subscribe({
      next: (evento) => {
        this.evento = evento;
      },
      error: (error) => {
        console.error('Error al cargar evento:', error);
        this.error = 'No se pudo cargar el evento';
      }
    });

    this.feedbackService.listarFeedbacksPorEvento(idEvento).subscribe({
      next: (feedbacks) => {
        this.feedbacks = feedbacks.sort((a, b) =>
          new Date(b.fecha!).getTime() - new Date(a.fecha!).getTime()
        );
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar feedbacks:', error);
        this.error = 'No se pudieron cargar los feedbacks';
        this.cargando = false;
      }
    });

    this.feedbackService.obtenerPromedioEvento(idEvento).subscribe({
      next: (promedio) => {
        this.promedioCalificacion = promedio;
      },
      error: (error) => {
        console.error('Error al cargar promedio:', error);
      }
    });
  }

  volver() {
    this.router.navigate(['/eventos']);
  }

  obtenerEstrellas(puntuacion: number): number[] {
    return Array(5).fill(0).map((_, i) => i + 1);
  }

  estaLlena(estrella: number, puntuacion: number): boolean {
    return estrella <= puntuacion;
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  obtenerDistribucionEstrellas(estrellas: number): number {
    if (this.feedbacks.length === 0) return 0;
    const cantidad = this.feedbacks.filter(f => f.puntuacion === estrellas).length;
    return (cantidad / this.feedbacks.length) * 100;
  }

  protected readonly Math = Math;
}
