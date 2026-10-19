import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SuscripcionService } from '../../services/suscripcion.service';
import { AuthService } from '../../services/auth.service';
import { SuscripcionDTO, PlanInfo, CambiarPlanDTO } from '../../models/suscripcion.model';
import { UsuarioActual } from '../../models/auth.model';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from '@angular/material/dialog';
import {MatList, MatListItem} from '@angular/material/list';

@Component({
  selector: 'app-suscripcion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatIconModule,
    MatTooltipModule,
    MatBadgeModule,
    MatSnackBarModule,
    MatTableModule,
    MatDividerModule,
    MatDialogModule,
    MatList,
    MatListItem
  ],
  templateUrl: './suscripcion.componente.html',
  styleUrl: './suscripcion.componente.css'
})
export class SuscripcionComponent implements OnInit {
  usuarioActual: UsuarioActual | null = null;
  suscripcionActual: SuscripcionDTO | null = null;
  historialSuscripciones: SuscripcionDTO[] = [];

  planes: PlanInfo[] = [
    {
      nombre: 'Basico',
      precio: 0,
      multiplicador: 1,
      duracion: '1 mes',
      descuentoCanje: 0,
      accesoEventosVIP: false,
      prioridadEventos: false,
      contenidoExclusivo: false,
      beneficios: [
        'Acceso a eventos públicos',
        'Canje de productos estándar',
        '1x multiplicador de puntos',
        'Participación en la comunidad'
      ],
      color: '#95a5a6',
      icono: 'eco'
    },
    {
      nombre: 'Premium',
      precio: 29.90,
      multiplicador: 2,
      duracion: '6 meses',
      descuentoCanje: 15,
      accesoEventosVIP: false,
      prioridadEventos: true,
      contenidoExclusivo: false,
      beneficios: [
        'Todas las ventajas del plan Básico',
        '2x multiplicador de puntos',
        'Acceso prioritario a eventos',
        '15% descuento en canjes',
        'Soporte prioritario',
        'Estadísticas avanzadas'
      ],
      color: '#3498db',
      icono: 'star'
    },
    {
      nombre: 'VIP',
      precio: 79.90,
      multiplicador: 3,
      duracion: '1 año',
      descuentoCanje: 30,
      accesoEventosVIP: true,
      prioridadEventos: true,
      contenidoExclusivo: true,
      beneficios: [
        'Todas las ventajas del plan Premium',
        '3x multiplicador de puntos',
        'Eventos exclusivos VIP',
        '30% descuento en canjes',
        'Contenido exclusivo',
        'Acceso anticipado a nuevas funciones',
        'Asesoría personalizada',
        'Beneficios especiales en eventos'
      ],
      color: '#f39c12',
      icono: 'workspace_premium'
    }
  ];

  cargando = true;
  procesando = false;
  error = '';
  mostrarModal = false;
  planSeleccionado: PlanInfo | null = null;
  metodoPagoId: number = 1;
  tipoAccion: 'crear' | 'cambiar' | 'renovar' = 'crear';

  displayedColumns: string[] = ['plan', 'fechaInicio', 'fechaFin', 'duracion', 'estado'];

  constructor(
    private suscripcionService: SuscripcionService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.usuarioActual = this.authService.obtenerUsuario();

    if (!this.usuarioActual) {
      this.mostrarMensaje('Debes iniciar sesión', 'error');
      this.router.navigate(['/login']);
      return;
    }

    if (this.usuarioActual.idusuario) {
      this.cargarSuscripcionActual();
      this.cargarHistorialSuscripciones();
    }
  }

  cargarSuscripcionActual() {
    if (!this.usuarioActual?.idusuario) return;

    this.suscripcionService.obtenerSuscripcionActual(this.usuarioActual.idusuario).subscribe({
      next: (suscripcion) => {
        console.log('✅ Suscripción actual:', suscripcion);
        this.suscripcionActual = suscripcion;
        this.cargando = false;
      },
      error: (error) => {
        console.log('ℹ️ No hay suscripción activa');
        this.suscripcionActual = null;
        this.cargando = false;
      }
    });
  }

  cargarHistorialSuscripciones() {
    if (!this.usuarioActual?.idusuario) return;

    this.suscripcionService.obtenerSuscripcionesUsuario(this.usuarioActual.idusuario).subscribe({
      next: (historial) => {
        console.log('✅ Historial de suscripciones:', historial);
        this.historialSuscripciones = historial.sort((a, b) =>
          new Date(b.fechainicio).getTime() - new Date(a.fechainicio).getTime()
        );
      },
      error: (error) => {
        console.error('❌ Error al cargar historial:', error);
      }
    });
  }

  abrirModalSuscripcion(plan: PlanInfo, accion: 'crear' | 'cambiar' | 'renovar' = 'crear') {
    if (plan.nombre === 'Basico' && accion === 'crear') {
      this.mostrarMensaje('Ya tienes el plan Básico de forma gratuita', 'error');
      return;
    }

    this.planSeleccionado = plan;
    this.tipoAccion = accion;
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.planSeleccionado = null;
    this.tipoAccion = 'crear';
  }

  confirmarAccion() {
    switch (this.tipoAccion) {
      case 'crear':
        this.crearSuscripcion();
        break;
      case 'cambiar':
        this.cambiarPlan();
        break;
      case 'renovar':
        this.renovarSuscripcion();
        break;
    }
  }

  crearSuscripcion() {
    if (!this.usuarioActual?.idusuario || !this.planSeleccionado) {
      this.mostrarMensaje('Error: Información incompleta', 'error');
      return;
    }

    this.procesando = true;
    this.error = '';

    const nuevaSuscripcion: SuscripcionDTO = {
      idusuario: this.usuarioActual.idusuario,
      idmetodopago: this.metodoPagoId,
      tipoplan: this.planSeleccionado.nombre,
      fechainicio: new Date().toISOString().split('T')[0],
      fechafin: '',
      descripcion: '',
      estado: 'Activa'
    };

    this.suscripcionService.crearSuscripcion(nuevaSuscripcion).subscribe({
      next: (suscripcionCreada) => {
        console.log('✅ Suscripción creada:', suscripcionCreada);
        this.mostrarMensaje(`¡Suscripción ${this.planSeleccionado?.nombre} activada exitosamente!`, 'success');
        this.suscripcionActual = suscripcionCreada;
        this.cargarHistorialSuscripciones();
        this.cerrarModal();
        this.procesando = false;
      },
      error: (error) => {
        console.error('Error al crear suscripción:', error);
        this.error = error.error || 'Error al procesar la suscripción';
        this.mostrarMensaje(this.error, 'error');
        this.procesando = false;
      }
    });
  }

  cambiarPlan() {
    if (!this.usuarioActual?.idusuario || !this.planSeleccionado) {
      this.mostrarMensaje('Error: Información incompleta', 'error');
      return;
    }

    this.procesando = true;

    const cambio: CambiarPlanDTO = {
      nuevoPlan: this.planSeleccionado.nombre,
      idMetodoPago: this.metodoPagoId
    };

    this.suscripcionService.cambiarPlan(this.usuarioActual.idusuario, cambio).subscribe({
      next: (suscripcionActualizada) => {
        console.log('Plan cambiado:', suscripcionActualizada);

        const esUpgrade = this.obtenerNivelPlan(this.planSeleccionado!.nombre) >
          this.obtenerNivelPlan(this.suscripcionActual!.tipoplan);

        const mensaje = esUpgrade
          ? `¡Upgrade exitoso a plan ${this.planSeleccionado?.nombre}! Tus nuevos beneficios están activos.`
          : `Plan programado: ${this.planSeleccionado?.nombre}. El cambio se aplicará cuando termine tu periodo actual.`;

        this.mostrarMensaje(mensaje, 'success');
        this.suscripcionActual = suscripcionActualizada;
        this.cargarHistorialSuscripciones();
        this.cerrarModal();
        this.procesando = false;
      },
      error: (error) => {
        console.error('Error al cambiar plan:', error);
        this.mostrarMensaje(error.error || 'Error al cambiar el plan', 'error');
        this.procesando = false;
      }
    });
  }

  renovarSuscripcion() {
    if (!this.suscripcionActual?.id || !this.planSeleccionado) {
      this.mostrarMensaje('No hay suscripción para renovar', 'error');
      return;
    }

    this.procesando = true;

    this.suscripcionService.renovarSuscripcion(
      this.suscripcionActual.id,
      this.planSeleccionado.nombre
    ).subscribe({
      next: (renovada) => {
        console.log('Suscripción renovada:', renovada);
        this.mostrarMensaje(`¡Suscripción renovada al plan ${this.planSeleccionado?.nombre}!`, 'success');
        this.suscripcionActual = renovada;
        this.cargarHistorialSuscripciones();
        this.cerrarModal();
        this.procesando = false;
      },
      error: (error) => {
        console.error('Error al renovar:', error);
        this.mostrarMensaje('Error al renovar la suscripción', 'error');
        this.procesando = false;
      }
    });
  }

  cancelarSuscripcionActual() {
    this.cancelarCompletamente();
  }

  cancelarCambioProgramado() {
    if (!this.suscripcionActual?.id) return;

    const planActual = this.suscripcionActual.tipoplan;
    const planProgramado = this.suscripcionActual.proximoPlan;

    const confirmacion = confirm(
      `¿Quieres cancelar el cambio programado?\n\n` +
      `Cambio programado: ${planActual} → ${planProgramado}\n\n` +
      `Si cancelas, mantendrás tu plan ${planActual} cuando termine el periodo actual.`
    );

    if (!confirmacion) return;

    this.procesando = true;

    this.suscripcionService.cancelarCambioProgramado(this.suscripcionActual.id)
      .subscribe({
        next: (suscripcion) => {
          console.log('Cambio programado cancelado:', suscripcion);
          this.mostrarMensaje(`¡Cambio cancelado! Mantendrás tu plan ${planActual}`, 'success');
          this.suscripcionActual = suscripcion;
          this.cargarHistorialSuscripciones();
          this.procesando = false;
        },
        error: (error) => {
          console.error('Error al cancelar cambio:', error);
          this.mostrarMensaje(error.error || 'Error al cancelar el cambio programado', 'error');
          this.procesando = false;
        }
      });
  }

  cancelarCompletamente() {
    if (!this.suscripcionActual?.id) return;

    const planActual = this.suscripcionActual.tipoplan;
    const planProgramado = this.suscripcionActual.proximoPlan;
    const fechaFin = this.formatearFecha(this.suscripcionActual.fechafin);
    const diasRestantes = this.calcularDiasRestantes();

    let mensajeConfirmacion = '';

    if (planProgramado === 'Basico') {
      mensajeConfirmacion =
        `Ya has cancelado tu suscripción.\n\n` +
        `Tu plan ${planActual} sigue activo hasta el ${fechaFin} (${diasRestantes} días).\n\n` +
        `¿Deseas reactivar tu suscripción y mantener ${planActual}?`;

      const confirmacion = confirm(mensajeConfirmacion);
      if (confirmacion) {
        this.reactivarSuscripcion();
      }
      return;
    }

    if (planProgramado && planProgramado !== 'Basico') {
      mensajeConfirmacion =
        `CANCELACIÓN COMPLETA\n\n` +
        `Situación actual:\n` +
        `• Plan actual: ${planActual} (${diasRestantes} días restantes)\n` +
        `• Cambio programado: ${planActual} → ${planProgramado}\n\n` +
        `Si cancelas completamente:\n` +
        `✗ Se cancelará el cambio a ${planProgramado}\n` +
        `✗ Volverás directamente a plan Básico gratuito\n` +
        `✓ Esto ocurrirá el ${fechaFin}\n\n` +
        `¿Estás seguro de cancelar TODO y volver a Básico?`;
    } else {
      mensajeConfirmacion =
        `¿Estás seguro de cancelar tu suscripción ${planActual}?\n\n` +
        `Tu plan seguirá activo hasta el ${fechaFin} (${diasRestantes} días restantes).\n\n` +
        `Después volverás automáticamente al plan Básico gratuito.`;
    }

    const confirmacion = confirm(mensajeConfirmacion);
    if (!confirmacion) return;

    this.procesando = true;

    this.suscripcionService.cancelarSuscripcion(this.suscripcionActual.id)
      .subscribe({
        next: (suscripcion) => {
          console.log('Suscripción cancelada completamente:', suscripcion);
          this.mostrarMensaje('Suscripción cancelada exitosamente', 'success');
          this.suscripcionActual = suscripcion;
          this.cargarHistorialSuscripciones();
          this.procesando = false;
        },
        error: (error) => {
          console.error('Error al cancelar:', error);
          const mensajeError = error.error?.message || error.error || 'Error al cancelar la suscripción';
          this.mostrarMensaje(mensajeError, 'error');
          this.procesando = false;
        }
      });
  }

  reactivarSuscripcion() {
    if (!this.suscripcionActual?.id) return;

    const planActual = this.suscripcionActual.tipoplan;

    const confirmacion = confirm(
      `¿Quieres reactivar tu suscripción ${planActual}?\n\n` +
      `Se cancelará el cambio a Básico y mantendrás tu plan ${planActual}.`
    );

    if (!confirmacion) return;

    this.procesando = true;

    this.suscripcionService.cancelarCambioProgramado(this.suscripcionActual.id)
      .subscribe({
        next: (suscripcion) => {
          console.log('Suscripción reactivada:', suscripcion);
          this.mostrarMensaje(`¡Suscripción reactivada! Mantendrás tu plan ${planActual}`, 'success');
          this.suscripcionActual = suscripcion;
          this.cargarHistorialSuscripciones();
          this.procesando = false;
        },
        error: (error) => {
          console.error('Error al reactivar:', error);
          this.mostrarMensaje(error.error || 'Error al reactivar la suscripción', 'error');
          this.procesando = false;
        }
      });
  }

  obtenerNivelPlan(plan: string): number {
    switch (plan) {
      case 'Basico': return 1;
      case 'Premium': return 2;
      case 'VIP': return 3;
      default: return 0;
    }
  }

  puedeHacerUpgrade(nombrePlan: string): boolean {
    if (!this.suscripcionActual) return nombrePlan !== 'Basico';
    const nivelActual = this.obtenerNivelPlan(this.suscripcionActual.tipoplan);
    const nivelNuevo = this.obtenerNivelPlan(nombrePlan);
    return nivelNuevo > nivelActual;
  }

  puedeHacerDowngrade(nombrePlan: string): boolean {
    if (!this.suscripcionActual) return false;
    const nivelActual = this.obtenerNivelPlan(this.suscripcionActual.tipoplan);
    const nivelNuevo = this.obtenerNivelPlan(nombrePlan);
    return nivelNuevo < nivelActual && nivelNuevo > 0;
  }

  tienePlanActivo(): boolean {
    return this.suscripcionActual !== null &&
      this.suscripcionActual.estado === 'Activa' &&
      this.suscripcionActual.tipoplan !== 'Basico' &&
      new Date(this.suscripcionActual.fechafin) > new Date();
  }

  esPlanActual(nombrePlan: string): boolean {
    if (!this.suscripcionActual) {
      return nombrePlan === 'Basico';
    }
    return this.suscripcionActual.tipoplan === nombrePlan;
  }

  tienePlanProgramado(): boolean {
    return this.suscripcionActual?.proximoPlan !== null &&
      this.suscripcionActual?.proximoPlan !== undefined;
  }

  calcularDiasRestantes(): number {
    if (!this.suscripcionActual) return 0;
    const hoy = new Date();
    const fin = new Date(this.suscripcionActual.fechafin);
    const diferencia = fin.getTime() - hoy.getTime();
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  obtenerEstadoColor(estado: string): string {
    switch(estado) {
      case 'Activa': return 'primary';
      case 'Cancelada': return 'accent';
      case 'Vencida': return 'warn';
      case 'Programada': return 'primary';
      case 'Reemplazada': return '';
      default: return '';
    }
  }

  obtenerIconoPlan(nombrePlan: string): string {
    const plan = this.planes.find(p => p.nombre === nombrePlan);
    return plan?.icono || 'eco';
  }

  obtenerTituloModal(): string {
    switch (this.tipoAccion) {
      case 'crear': return 'Confirmar Suscripción';
      case 'cambiar': return 'Cambiar Plan';
      case 'renovar': return 'Renovar Suscripción';
      default: return 'Confirmar';
    }
  }

  mostrarMensaje(mensaje: string, tipo: 'success' | 'error') {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: tipo === 'success' ? 'snackbar-success' : 'snackbar-error'
    });
  }
}
