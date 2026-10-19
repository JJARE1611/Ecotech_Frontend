import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EventoService } from '../../services/evento.service';
import { AuthService } from '../../services/auth.service';
import { EventoDTO } from '../../models/evento.model';
import { UsuarioActual } from '../../models/auth.model';

// Angular Material Imports
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';

@Component({
  selector: 'app-eventos',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatBadgeModule
  ],
  templateUrl: './eventos.componente.html',
  styleUrl: './eventos.componente.css'
})
export class EventosComponent implements OnInit {
  eventos: EventoDTO[] = [];
  eventosProximos: EventoDTO[] = [];
  eventosEnCurso: EventoDTO[] = [];
  eventosPasados: EventoDTO[] = [];
  usuarioActual: UsuarioActual | null = null;

  // Beneficios del usuario
  planUsuario: string = 'Basico';
  multiplicadorPuntos: number = 1;
  descuentoCanjes: number = 0;

  cargando = true;
  error = '';

  private coloresCategoria: { [key: string]: string } = {
    'Reciclaje': '#4CAF50',
    'Limpieza': '#2196F3',
    'Plantación': '#8BC34A',
    'Educación': '#FF9800'
  };

  private imagenesCategoria: { [key: string]: string } = {
    'Reciclaje': 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800',
    'Limpieza': 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=800',
    'Plantación': 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800',
    'Educación': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800'
  };

  constructor(
    private eventoService: EventoService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.usuarioActual = this.authService.obtenerUsuario();

    if (this.usuarioActual?.idusuario) {
      this.cargarBeneficiosUsuario();
    }

    this.cargarEventos();
  }

  cargarBeneficiosUsuario() {
    if (!this.usuarioActual?.idusuario) return;

    this.eventoService.obtenerBeneficiosUsuario(this.usuarioActual.idusuario).subscribe({
      next: (beneficios) => {
        console.log('Beneficios del usuario:', beneficios);
        this.planUsuario = beneficios.plan || 'Basico';
        this.multiplicadorPuntos = beneficios.multiplicadorPuntos || 1;
        this.descuentoCanjes = beneficios.descuentoCanjes || 0;
      },
      error: (error) => {
        console.error('Error al obtener beneficios:', error);
        this.planUsuario = 'Basico';
        this.multiplicadorPuntos = 1;
        this.descuentoCanjes = 0;
      }
    });
  }

  cargarEventos() {
    this.cargando = true;
    this.error = '';

    if (this.usuarioActual?.idusuario) {
      this.cargarEventosDisponibles();
    } else {
      this.cargarTodosLosEventos();
    }
  }

  cargarEventosDisponibles() {
    if (!this.usuarioActual?.idusuario) return;

    this.eventoService.obtenerEventosDisponiblesParaUsuario(this.usuarioActual.idusuario).subscribe({
      next: (eventosDisponibles) => {
        console.log('Eventos disponibles según plan:', eventosDisponibles);
        this.separarEventosPorEstado(eventosDisponibles);
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar eventos disponibles:', error);
        this.cargarTodosLosEventos();
      }
    });
  }

  cargarTodosLosEventos() {
    this.eventoService.listarEventos().subscribe({
      next: (todosLosEventos) => {
        console.log('Todos los eventos cargados:', todosLosEventos);
        this.separarEventosPorEstado(todosLosEventos);
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar eventos:', error);
        this.error = 'No se pudieron cargar los eventos';
        this.cargando = false;
      }
    });
  }

  separarEventosPorEstado(eventos: EventoDTO[]) {
    this.eventosProximos = eventos
      .filter(e => e.estadoEvento?.toLowerCase() === 'programado')
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

    this.eventosEnCurso = eventos
      .filter(e => e.estadoEvento?.toLowerCase() === 'en curso')
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

    this.eventosPasados = eventos
      .filter(e => e.estadoEvento?.toLowerCase() === 'finalizado')
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }

  calcularPuntosConMultiplicador(puntosBase: number): number {
    return puntosBase * this.multiplicadorPuntos;
  }

  puedeAccederEvento(tipoEvento?: string): boolean {
    if (!tipoEvento || tipoEvento === 'publico') return true;

    switch (tipoEvento.toLowerCase()) {
      case 'vip':
        return this.planUsuario === 'VIP';
      case 'premium':
        return this.planUsuario === 'Premium' || this.planUsuario === 'VIP';
      default:
        return true;
    }
  }

  obtenerMensajeRestriccion(tipoEvento?: string): string {
    if (!tipoEvento || tipoEvento === 'publico') return '';

    switch (tipoEvento.toLowerCase()) {
      case 'vip':
        return '👑 Evento exclusivo VIP';
      case 'premium':
        return '⭐ Requiere plan Premium o VIP';
      default:
        return '';
    }
  }

  obtenerIconoPlan(): string {
    switch (this.planUsuario) {
      case 'Premium': return '⭐';
      case 'VIP': return '👑';
      default: return '🌱';
    }
  }

  obtenerColorPlan(): string {
    switch (this.planUsuario) {
      case 'Premium': return '#FF9800';
      case 'VIP': return '#9C27B0';
      default: return '#4CAF50';
    }
  }

  inscribirseEvento(evento: EventoDTO) {
    if (!this.usuarioActual) {
      alert('Debes iniciar sesión para inscribirte');
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/eventos' }
      });
      return;
    }

    if (!this.puedeAccederEvento(evento.tipoEvento)) {
      const mensaje = evento.tipoEvento === 'vip'
        ? '👑 Este es un evento exclusivo VIP.\n\n¿Deseas actualizar tu plan para acceder?'
        : '⭐ Este evento requiere plan Premium o VIP.\n\n¿Deseas actualizar tu plan?';

      if (confirm(mensaje)) {
        this.router.navigate(['/suscripciones']);
      }
      return;
    }

    if (evento.capacidadMaxima) {
      this.eventoService.verificarCapacidad(evento.id!).subscribe({
        next: (response) => {
          if (response.tieneCapacidad) {
            this.router.navigate(['/eventos', evento.id, 'inscribirse']);
          } else {
            alert('Lo sentimos, este evento ha alcanzado su capacidad máxima.');
          }
        },
        error: (error) => {
          console.error('Error al verificar capacidad:', error);
          this.router.navigate(['/eventos', evento.id, 'inscribirse']);
        }
      });
    } else {
      this.router.navigate(['/eventos', evento.id, 'inscribirse']);
    }
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    const opciones: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    };
    return date.toLocaleDateString('es-ES', opciones);
  }

  verMisEventos() {
    this.router.navigate(['/mis-eventos']);
  }

  verFeedbacks(idEvento: number) {
    this.router.navigate(['/eventos', idEvento, 'opiniones']);
  }

  obtenerImagenEvento(evento: EventoDTO): string {
    if (evento.imagenBanner) {
      return evento.imagenBanner;
    }

    if (evento.categoria && this.imagenesCategoria[evento.categoria]) {
      return this.imagenesCategoria[evento.categoria];
    }

    return 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800';
  }

  obtenerColorCategoria(categoria?: string): string {
    if (!categoria) return '#7fb843';
    return this.coloresCategoria[categoria] || '#7fb843';
  }
}
