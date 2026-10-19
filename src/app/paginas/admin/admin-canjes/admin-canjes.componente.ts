import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CanjeService } from '../../../services/canje.service';
import { CanjeUsuarioDTO } from '../../../models/canje.model';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-admin-canjes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatIconModule,
    MatTooltipModule,
    MatBadgeModule,
    MatSnackBarModule,
    MatTableModule,
    MatInputModule
  ],
  templateUrl: './admin-canjes.componente.html',
  styleUrl: './admin-canjes.componente.css'
})
export class AdminCanjesComponent implements OnInit {
  canjes: CanjeUsuarioDTO[] = [];

  cargando = true;
  error = '';

  filtroEstado = '';

  estadosDisponibles = ['pendiente', 'aprobado', 'entregado', 'rechazado'];
  metodosEntrega = ['digital', 'físico', 'retiro en tienda'];

  modalObservaciones = false;
  canjeSeleccionado: CanjeUsuarioDTO | null = null;
  observacionesTexto = '';
  guardandoObservaciones = false;

  modalDireccion = false;
  displayedColumns: string[] = [
    'id',
    'usuario',
    'producto',
    'cantidad',
    'fecha',
    'estado',
    'metodoEntrega',
    'direccion',
    'observaciones',
    'acciones'
  ];

  constructor(
    private canjeService: CanjeService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.cargarCanjes();
  }

  cargarCanjes() {
    this.cargando = true;
    this.error = '';

    this.canjeService.listarTodosCanjes().subscribe({
      next: (canjes) => {
        console.log('Canjes cargados:', canjes);
        this.canjes = canjes.sort((a, b) =>
          new Date(b.fechacanje).getTime() - new Date(a.fechacanje).getTime()
        );
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar canjes:', error);
        this.error = 'No se pudieron cargar los canjes';
        this.cargando = false;
        this.mostrarMensaje('Error al cargar canjes', 'error');
      }
    });
  }

  aplicarFiltros() {
    if (!this.filtroEstado) {
      this.cargarCanjes();
      return;
    }

    this.cargando = true;
    this.error = '';

    this.canjeService.listarCanjesPorEstado(this.filtroEstado).subscribe({
      next: (canjes) => {
        console.log('Canjes filtrados:', canjes);
        this.canjes = canjes.sort((a, b) =>
          new Date(b.fechacanje).getTime() - new Date(a.fechacanje).getTime()
        );
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al filtrar canjes:', error);
        this.error = 'Error al filtrar canjes';
        this.cargando = false;
        this.mostrarMensaje('Error al filtrar canjes', 'error');
      }
    });
  }

  limpiarFiltros() {
    this.filtroEstado = '';
    this.cargarCanjes();
  }

  cambiarEstado(canje: CanjeUsuarioDTO, nuevoEstado: string) {
    if (!canje.id) return;

    const mensaje = `¿Cambiar el estado del canje #${canje.id} a "${nuevoEstado}"?`;
    if (!confirm(mensaje)) return;

    this.canjeService.actualizarEstadoCanje(canje.id, nuevoEstado).subscribe({
      next: (actualizado) => {
        console.log('Estado actualizado:', actualizado);
        this.mostrarMensaje('Estado actualizado exitosamente', 'success');
        this.cargarCanjes();
      },
      error: (error) => {
        console.error('Error al actualizar estado:', error);
        this.mostrarMensaje('Error al actualizar el estado', 'error');
      }
    });
  }

  cambiarMetodoEntrega(canje: CanjeUsuarioDTO) {
    if (!canje.id) return;

    const nuevoMetodo = prompt(
      `Método actual: ${canje.metodoEntrega || 'No especificado'}\n\n` +
      `Ingrese el nuevo método de entrega:\n` +
      `- digital\n- físico\n- retiro en tienda`,
      canje.metodoEntrega || ''
    );

    if (!nuevoMetodo) return;

    this.canjeService.actualizarMetodoEntrega(canje.id, nuevoMetodo).subscribe({
      next: (actualizado) => {
        console.log('Método actualizado:', actualizado);
        this.mostrarMensaje('Método de entrega actualizado', 'success');
        this.cargarCanjes();
      },
      error: (error) => {
        console.error('Error al actualizar método:', error);
        this.mostrarMensaje('Error al actualizar el método de entrega', 'error');
      }
    });
  }

  abrirModalObservaciones(canje: CanjeUsuarioDTO) {
    this.canjeSeleccionado = canje;
    this.observacionesTexto = canje.observaciones || '';
    this.modalObservaciones = true;
  }

  cerrarModalObservaciones() {
    this.modalObservaciones = false;
    this.canjeSeleccionado = null;
    this.observacionesTexto = '';
    this.guardandoObservaciones = false;
  }

  guardarObservaciones() {
    if (!this.canjeSeleccionado?.id) return;

    this.guardandoObservaciones = true;

    this.canjeService.agregarObservaciones(
      this.canjeSeleccionado.id,
      this.observacionesTexto
    ).subscribe({
      next: (actualizado) => {
        console.log('Observaciones guardadas:', actualizado);
        this.mostrarMensaje('Observaciones guardadas exitosamente', 'success');
        this.cerrarModalObservaciones();
        this.cargarCanjes();
      },
      error: (error) => {
        console.error('Error al guardar observaciones:', error);
        this.mostrarMensaje('Error al guardar observaciones', 'error');
        this.guardandoObservaciones = false;
      }
    });
  }

  verDireccion(canje: CanjeUsuarioDTO) {
    this.canjeSeleccionado = canje;
    this.modalDireccion = true;
  }

  cerrarModalDireccion() {
    this.modalDireccion = false;
    this.canjeSeleccionado = null;
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  obtenerNombreUsuario(canje: CanjeUsuarioDTO): string {
    if (canje.usuario?.nombre) {
      return canje.usuario.nombre;
    }
    return `Usuario #${canje.idUsuario}`;
  }

  obtenerEmailUsuario(canje: CanjeUsuarioDTO): string {
    return canje.usuario?.email || '';
  }

  obtenerNombreProducto(canje: CanjeUsuarioDTO): string {
    if (canje.producto?.nombre) {
      return canje.producto.nombre;
    }
    return `Producto #${canje.idProducto}`;
  }

  obtenerPuntosProducto(canje: CanjeUsuarioDTO): number {
    return canje.producto?.puntosrequerido || 0;
  }

  obtenerColorEstado(estado?: string): string {
    if (!estado) return '';

    switch (estado.toLowerCase()) {
      case 'pendiente':
        return 'accent';
      case 'aprobado':
        return 'primary';
      case 'entregado':
        return 'primary';
      case 'rechazado':
        return 'warn';
      default:
        return '';
    }
  }

  obtenerIconoEstado(estado?: string): string {
    if (!estado) return 'help_outline';

    switch (estado.toLowerCase()) {
      case 'pendiente':
        return 'hourglass_empty';
      case 'aprobado':
        return 'check_circle';
      case 'entregado':
        return 'inventory';
      case 'rechazado':
        return 'cancel';
      default:
        return 'help_outline';
    }
  }

  obtenerIconoMetodoEntrega(metodo?: string): string {
    if (!metodo) return 'help_outline';

    switch (metodo.toLowerCase()) {
      case 'digital':
        return 'computer';
      case 'físico':
        return 'local_shipping';
      case 'retiro en tienda':
        return 'store';
      default:
        return 'help_outline';
    }
  }

  mostrarMensaje(mensaje: string, tipo: 'success' | 'error') {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: tipo === 'success' ? 'snackbar-success' : 'snackbar-error'
    });
  }
}
