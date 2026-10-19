import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EventoService } from '../../services/evento.service';
import { AuthService } from '../../services/auth.service';
import { EventoDTO, InscripcionEventoDTO } from '../../models/evento.model';
import { UsuarioActual } from '../../models/auth.model';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-evento-inscripcion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatListModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './evento-inscripcion.componente.html',
  styleUrl: './evento-inscripcion.componente.css'
})
export class EventoInscripcionComponent implements OnInit {
  evento: EventoDTO | null = null;
  usuarioActual: UsuarioActual | null = null;


  cargando = true;
  inscribiendo = false;
  error = '';
  yaInscrito = false;

  motivoParticipacion = '';
  aceptaTerminos = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventoService: EventoService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.usuarioActual = this.authService.obtenerUsuario();

    if (!this.usuarioActual) {
      alert('Debes iniciar sesión para inscribirte a un evento');
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: this.router.url }
      });
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
        console.log('Evento cargado:', evento);
        this.evento = evento;

        // Verificar si ya está inscrito
        if (this.usuarioActual?.idusuario) {
          this.verificarInscripcionPrevia(idEvento, this.usuarioActual.idusuario);
        } else {
          this.cargando = false;
        }
      },
      error: (error) => {
        console.error('Error al cargar evento:', error);
        this.error = 'No se pudo cargar el evento';
        this.cargando = false;
      }
    });
  }

  verificarInscripcionPrevia(idEvento: number, idUsuario: number) {
    this.eventoService.verificarInscripcion(idEvento, idUsuario).subscribe({
      next: (estaInscrito) => {
        this.yaInscrito = estaInscrito;
        this.cargando = false;

        if (estaInscrito) {
          console.log('Usuario ya inscrito en este evento');
        }
      },
      error: (error) => {
        console.error('Error al verificar inscripción:', error);
        this.cargando = false;
      }
    });
  }

  inscribirse() {
    if (!this.evento || !this.usuarioActual?.idusuario) {
      alert('Error: Información incompleta');
      return;
    }

    if (!this.aceptaTerminos) {
      alert('Debes aceptar los términos y condiciones');
      return;
    }

    if (this.yaInscrito) {
      alert('Ya estás inscrito en este evento');
      return;
    }

    this.inscribiendo = true;
    this.error = '';

    const inscripcion: InscripcionEventoDTO = {
      idevento: this.evento.id!,
      idusuario: this.usuarioActual.idusuario,
      fechainscripcion: new Date().toISOString().split('T')[0],
      asistio: false,
      puntosotorgados: 0
    };

    console.log('📤 Enviando inscripción:', inscripcion);

    this.eventoService.inscribirseEvento(inscripcion).subscribe({
      next: (inscripcionCreada) => {
        console.log('✅ Inscripción exitosa:', inscripcionCreada);
        alert(`¡Te has inscrito exitosamente al evento "${this.evento?.nombre}"!\n\nRecibirás ${this.evento?.puntos} Eco-Puntos al asistir.`);
        this.router.navigate(['/mis-eventos']);
      },
      error: (error) => {
        console.error('❌ Error al inscribirse:', error);

        if (error.status === 400) {
          this.error = error.error || 'Ya estás inscrito en este evento';
        } else if (error.status === 0) {
          this.error = 'No se pudo conectar con el servidor';
        } else {
          this.error = 'Error al inscribirse. Intenta nuevamente.';
        }

        this.inscribiendo = false;
      },
      complete: () => {
        this.inscribiendo = false;
      }
    });
  }

  cancelar() {
    this.router.navigate(['/eventos']);
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
}
