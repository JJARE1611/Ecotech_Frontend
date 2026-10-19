import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FeedbackService } from '../../services/feedback.service';
import { EventoService } from '../../services/evento.service';
import { AuthService } from '../../services/auth.service';
import { CrearFeedbackDTO } from '../../models/feedback.model';
import { EventoDTO } from '../../models/evento.model';
import { UsuarioActual } from '../../models/auth.model';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-evento-feedback',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './evento-feedback.componente.html',
  styleUrls: ['./evento-feedback.componente.css']
})
export class EventoFeedbackComponent implements OnInit {
  evento: EventoDTO | null = null;
  usuarioActual: UsuarioActual | null = null;

  // Estados
  cargando = true;
  enviando = false;
  error = '';
  puedeDejarFeedback = false;

  // Formulario
  puntuacion: number = 0;
  puntuacionHover: number = 0;
  comentario: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private feedbackService: FeedbackService,
    private eventoService: EventoService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.usuarioActual = this.authService.obtenerUsuario();

    if (!this.usuarioActual) {
      alert('Debes iniciar sesión para dejar feedback');
      this.router.navigate(['/login']);
      return;
    }

    const idEvento = this.route.snapshot.paramMap.get('id');

    if (idEvento) {
      this.cargarEvento(parseInt(idEvento));
    } else {
      this.error = 'ID de evento inválido';
      this.cargando = false;
    }
  }

  cargarEvento(idEvento: number) {
    this.cargando = true;
    this.error = '';

    this.eventoService.obtenerEvento(idEvento).subscribe({
      next: (evento) => {
        this.evento = evento;

        if (this.usuarioActual?.idusuario) {
          this.verificarAsistencia(idEvento, this.usuarioActual.idusuario);
        }
      },
      error: (error) => {
        console.error('Error al cargar evento:', error);
        this.error = 'No se pudo cargar el evento';
        this.cargando = false;
      }
    });
  }

  verificarAsistencia(idEvento: number, idUsuario: number) {
    this.feedbackService.validarAsistencia(idUsuario, idEvento).subscribe({
      next: (asistio) => {
        this.puedeDejarFeedback = asistio;

        if (!asistio) {
          this.error = 'Solo puedes dejar feedback en eventos a los que asististe';
        }

        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al verificar asistencia:', error);
        this.error = 'Error al verificar tu asistencia';
        this.cargando = false;
      }
    });
  }

  seleccionarPuntuacion(puntuacion: number) {
    this.puntuacion = puntuacion;
  }

  onMouseEnter(puntuacion: number) {
    this.puntuacionHover = puntuacion;
  }

  onMouseLeave() {
    this.puntuacionHover = 0;
  }

  validarFormulario(): boolean {
    if (this.puntuacion === 0) {
      this.error = 'Debes seleccionar una calificación';
      return false;
    }

    if (!this.comentario || this.comentario.trim().length === 0) {
      this.error = 'El comentario no puede estar vacío';
      return false;
    }

    if (this.comentario.trim().length < 10) {
      this.error = 'El comentario debe tener al menos 10 caracteres';
      return false;
    }

    return true;
  }

  enviarFeedback() {
    this.error = '';

    if (!this.validarFormulario()) {
      return;
    }

    if (!this.usuarioActual?.idusuario || !this.evento?.id) {
      this.error = 'Información incompleta';
      return;
    }

    this.enviando = true;

    const feedback: CrearFeedbackDTO = {
      idEvento: this.evento.id,
      idUsuario: this.usuarioActual.idusuario,
      comentario: this.comentario.trim(),
      puntuacion: this.puntuacion
    };

    console.log('📤 Enviando feedback:', feedback);

    this.feedbackService.crearFeedback(feedback).subscribe({
      next: (feedbackCreado) => {
        console.log('Feedback creado:', feedbackCreado);
        alert('¡Gracias por tu feedback! Tu opinión es muy importante.');
        this.router.navigate(['/mis-eventos']);
      },
      error: (error) => {
        console.error('Error al crear feedback:', error);

        if (error.status === 400) {
          this.error = error.error || 'Error al crear el feedback';
        } else {
          this.error = 'Error al enviar el feedback. Intenta nuevamente.';
        }

        this.enviando = false;
      }
    });
  }

  cancelar() {
    this.router.navigate(['/mis-eventos']);
  }

  obtenerEstrellas(): number[] {
    return [1, 2, 3, 4, 5];
  }

  estaSeleccionada(estrella: number): boolean {
    const puntuacionActual = this.puntuacionHover > 0 ? this.puntuacionHover : this.puntuacion;
    return estrella <= puntuacionActual;
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
}
