import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EventoService } from '../../services/evento.service';
import { AuthService } from '../../services/auth.service';
import { UsuarioEventoDTO } from '../../models/evento.model';
import { UsuarioActual } from '../../models/auth.model';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-mis-eventos',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatListModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './mis-eventos.componente.html',
  styleUrls: ['./mis-eventos.componente.css']
})
export class MisEventosComponent implements OnInit {
  misEventos: UsuarioEventoDTO[] = [];
  eventosProximos: UsuarioEventoDTO[] = [];
  eventosPasados: UsuarioEventoDTO[] = [];
  usuarioActual: UsuarioActual | null = null;

  cargando = true;
  error = '';

  planUsuario: string = 'Basico';
  multiplicadorPuntos: number = 1;

  constructor(
    private eventoService: EventoService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.usuarioActual = this.authService.obtenerUsuario();

    if (!this.usuarioActual) {
      this.router.navigate(['/login']);
      return;
    }
    if (this.usuarioActual.idusuario) {
      this.cargarBeneficiosUsuario();
      this.cargarMisEventos(this.usuarioActual.idusuario);
    }
  }

  cargarBeneficiosUsuario() {
    if (!this.usuarioActual?.idusuario) return;

    this.eventoService.obtenerBeneficiosUsuario(this.usuarioActual.idusuario).subscribe({
      next: (beneficios) => {
        this.planUsuario = beneficios.plan || 'Basico';
        this.multiplicadorPuntos = beneficios.multiplicadorPuntos || 1;
      },
      error: (error) => {
        console.error('Error al obtener beneficios:', error);
      }
    });
  }

  cargarMisEventos(idUsuario: number) {
    this.cargando = true;
    this.error = '';

    this.eventoService.obtenerMisEventos(idUsuario).subscribe({
      next: (inscripciones) => {
        console.log('Mis eventos cargados:', inscripciones);
        this.misEventos = inscripciones;
        this.separarEventos();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar mis eventos:', error);
        this.error = 'No se pudieron cargar tus eventos';
        this.cargando = false;
      }
    });
  }

  separarEventos() {
    this.eventosProximos = this.misEventos
      .filter(inscripcion =>
        inscripcion.evento?.estadoEvento?.toLowerCase() === 'programado'
      )
      .sort((a, b) => {
        const fechaA = new Date(a.evento!.fecha).getTime();
        const fechaB = new Date(b.evento!.fecha).getTime();
        return fechaA - fechaB;
      });

    this.eventosPasados = this.misEventos
      .filter(inscripcion =>
        inscripcion.evento?.estadoEvento?.toLowerCase() === 'finalizado'
      )
      .sort((a, b) => {
        const fechaA = new Date(a.evento!.fecha).getTime();
        const fechaB = new Date(b.evento!.fecha).getTime();
        return fechaB - fechaA;
      });
  }

  cancelarInscripcion(inscripcion: UsuarioEventoDTO) {
    if (!inscripcion.id) return;

    const confirmar = confirm(
      `¿Estás seguro de cancelar tu inscripción al evento "${inscripcion.evento?.nombre}"?\n\n` +
      `Esta acción no se puede deshacer.`
    );

    if (!confirmar) return;

    this.eventoService.cancelarInscripcion(inscripcion.id).subscribe({
      next: () => {
        console.log('Inscripción cancelada');
        alert('Inscripción cancelada exitosamente');
        this.cargarMisEventos(this.usuarioActual!.idusuario!);
      },
      error: (error) => {
        console.error('Error al cancelar inscripción:', error);
        alert('Error al cancelar la inscripción. Intenta nuevamente.');
      }
    });
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

  calcularDiasRestantes(fecha: string): number {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaEvento = new Date(fecha);
    fechaEvento.setHours(0, 0, 0, 0);

    const diferencia = fechaEvento.getTime() - hoy.getTime();
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
  }

  obtenerMensajeDias(fecha: string): string {
    const dias = this.calcularDiasRestantes(fecha);

    if (dias === 0) return '¡Hoy!';
    if (dias === 1) return 'Mañana';
    if (dias > 0) return `En ${dias} días`;
    return 'Finalizado';
  }

  volverAEventos() {
    this.router.navigate(['/eventos']);
  }

  dejarFeedback(idEvento: number) {
    this.router.navigate(['/eventos', idEvento, 'feedback']);
  }

  verFeedbacks(idEvento: number) {
    this.router.navigate(['/eventos', idEvento, 'opiniones']);
  }
}
