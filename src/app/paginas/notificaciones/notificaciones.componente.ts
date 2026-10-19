import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificacionService } from '../../services/notificacion.service';
import { AuthService } from '../../services/auth.service';
import { NotificacionDTO } from '../../models/canje.model';
import { Subscription, interval } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatCardModule,
    MatListModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './notificaciones.componente.html',
  styleUrl: './notificaciones.componente.css'
})
export class NotificacionesComponent implements OnInit, OnDestroy {
  notificaciones: NotificacionDTO[] = [];
  contadorNoLeidas: number = 0;
  mostrarPanel: boolean = false;
  cargando: boolean = false;

  private subscriptions: Subscription[] = [];
  private pollingSubscription?: Subscription;

  constructor(
    private notificacionService: NotificacionService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const usuario = this.authService.obtenerUsuario();
    if (usuario?.idusuario) {
      this.cargarNotificaciones(usuario.idusuario);
      this.iniciarPolling(usuario.idusuario);


      const contadorSub = this.notificacionService.getContadorNotificaciones()
        .subscribe(contador => {
          this.contadorNoLeidas = contador;
        });

      this.subscriptions.push(contadorSub);
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  /**
   * Polling cada 30 segundos para actualizar notificaciones
   */
  iniciarPolling(idUsuario: number) {
    this.pollingSubscription = interval(30000).subscribe(() => {
      if (!this.mostrarPanel) {
        this.notificacionService.contarNotificacionesNoLeidas(idUsuario).subscribe();
      }
    });
  }

  cargarNotificaciones(idUsuario: number) {
    this.cargando = true;

    this.notificacionService.obtenerNotificaciones(idUsuario).subscribe({
      next: (notificaciones) => {
        this.notificaciones = notificaciones;
        this.contadorNoLeidas = notificaciones.filter(n => !n.leida).length;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar notificaciones:', error);
        this.cargando = false;
      }
    });
  }

  togglePanel() {
    this.mostrarPanel = !this.mostrarPanel;

    if (this.mostrarPanel) {
      const usuario = this.authService.obtenerUsuario();
      if (usuario?.idusuario) {
        this.cargarNotificaciones(usuario.idusuario);
      }
    }
  }

  cerrarPanel() {
    this.mostrarPanel = false;
  }

  marcarLeida(notificacion: NotificacionDTO) {
    if (!notificacion.id || notificacion.leida) return;

    this.notificacionService.marcarComoLeida(notificacion.id).subscribe({
      next: () => {
        notificacion.leida = true;
        this.contadorNoLeidas = Math.max(0, this.contadorNoLeidas - 1);
        this.notificacionService.actualizarContador(this.contadorNoLeidas);

        if (notificacion.idReferencia) {
          this.router.navigate(['/mis-canjes']);
          this.cerrarPanel();
        }
      },
      error: (error) => {
        console.error('Error al marcar como leída:', error);
      }
    });
  }

  marcarTodasLeidas() {
    const usuario = this.authService.obtenerUsuario();
    if (!usuario?.idusuario) return;

    this.notificacionService.marcarTodasComoLeidas(usuario.idusuario).subscribe({
      next: () => {
        this.notificaciones.forEach(n => n.leida = true);
        this.contadorNoLeidas = 0;
        this.notificacionService.actualizarContador(0);
      },
      error: (error) => {
        console.error('Error al marcar todas como leídas:', error);
      }
    });
  }

  eliminarNotificacion(notificacion: NotificacionDTO, event: Event) {
    event.stopPropagation();

    if (!notificacion.id) return;

    if (!confirm('¿Eliminar esta notificación?')) return;

    this.notificacionService.eliminarNotificacion(notificacion.id).subscribe({
      next: () => {
        this.notificaciones = this.notificaciones.filter(n => n.id !== notificacion.id);
        if (!notificacion.leida) {
          this.contadorNoLeidas = Math.max(0, this.contadorNoLeidas - 1);
          this.notificacionService.actualizarContador(this.contadorNoLeidas);
        }
      },
      error: (error) => {
        console.error('Error al eliminar notificación:', error);
        alert('Error al eliminar la notificación');
      }
    });
  }

  verTodasNotificaciones() {
    this.router.navigate(['/notificaciones']);
    this.cerrarPanel();
  }

  formatearFecha(fecha: string): string {
    const ahora = new Date();
    const fechaNotif = new Date(fecha);
    const diffMs = ahora.getTime() - fechaNotif.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;

    return fechaNotif.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }

  obtenerIconoNotificacion(tipo?: string): string {
    switch (tipo) {
      case 'canje_aprobado': return 'check_circle';
      case 'canje_rechazado': return 'cancel';
      case 'canje_pendiente': return 'hourglass_empty';
      case 'producto_disponible': return 'shopping_bag';
      case 'puntos_obtenidos': return 'stars';
      default: return 'notifications';
    }
  }
}
