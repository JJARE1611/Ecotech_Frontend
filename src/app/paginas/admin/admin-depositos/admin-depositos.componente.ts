import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DepositoService } from '../../../services/deposito.service';
import { DepositoDTO } from '../../../models/deposito.model';

// Angular Material Imports
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-admin-depositos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatChipsModule,
    MatDividerModule
  ],
  templateUrl: './admin-depositos.componente.html',
  styleUrl: './admin-depositos.componente.css'
})
export class AdminDepositosComponent implements OnInit {
  depositos: DepositoDTO[] = [];
  depositosFiltrados: DepositoDTO[] = [];

  // Filtros
  filtroEstado: string = 'todos';

  // Estados
  cargando = true;
  error = '';

  // Modal de detalle
  modalDetalle = false;
  depositoSeleccionado: DepositoDTO | null = null;
  procesando = false;

  // ✅ NUEVO: Modal de imagen
  modalImagen = false;
  imagenSeleccionada = '';

  // Tipos de residuos
  tiposResiduos: { [key: string]: { nombre: string; puntosPorKg: number; icono: string } } = {
    'organico': { nombre: 'Residuo Orgánico', puntosPorKg: 10, icono: 'eco' },
    'plastico': { nombre: 'Residuo Plástico', puntosPorKg: 20, icono: 'water_drop' },
    'metalico': { nombre: 'Residuo Metálico', puntosPorKg: 30, icono: 'build' },
    'electronico': { nombre: 'Residuo Electrónico y baterías', puntosPorKg: 50, icono: 'power' }
  };

  constructor(
    private depositoService: DepositoService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.cargarDepositos();
  }

  cargarDepositos() {
    this.cargando = true;
    this.error = '';

    this.depositoService.listarTodos().subscribe({
      next: (depositos) => {
        this.depositos = depositos.sort((a, b) =>
          new Date(b.fechaenvio).getTime() - new Date(a.fechaenvio).getTime()
        );
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar depósitos:', error);
        this.error = 'No se pudieron cargar los depósitos';
        this.cargando = false;
        this.mostrarMensaje('Error al cargar depósitos', 'error');
      }
    });
  }

  aplicarFiltros() {
    if (this.filtroEstado === 'todos') {
      this.depositosFiltrados = [...this.depositos];
    } else {
      this.depositosFiltrados = this.depositos.filter(
        d => d.estado === this.filtroEstado
      );
    }
  }

  verDetalle(deposito: DepositoDTO) {
    this.depositoSeleccionado = deposito;
    this.modalDetalle = true;
  }

  cerrarModal() {
    this.modalDetalle = false;
    this.depositoSeleccionado = null;
  }

  validarDeposito(aprobado: boolean) {
    if (!this.depositoSeleccionado?.id) return;

    const mensaje = aprobado
      ? '¿Aprobar este depósito?\n\nSe calcularán y otorgarán los Eco-Puntos al usuario.'
      : '¿Rechazar este depósito?\n\nNo se otorgarán puntos al usuario.';

    if (!confirm(mensaje)) return;

    this.procesando = true;

    this.depositoService.validarDeposito(this.depositoSeleccionado.id, aprobado).subscribe({
      next: (depositoActualizado) => {
        if (aprobado) {
          this.mostrarMensaje(
            `Depósito aprobado. Se otorgaron ${depositoActualizado.puntosotorgados} Eco-Puntos al usuario.`,
            'success'
          );
        } else {
          this.mostrarMensaje('Depósito rechazado.', 'success');
        }

        this.cargarDepositos();
        this.cerrarModal();
        this.procesando = false;
      },
      error: (error) => {
        console.error('Error al validar depósito:', error);
        this.mostrarMensaje(
          'Error al validar el depósito: ' + (error.error || error.message),
          'error'
        );
        this.procesando = false;
      }
    });
  }

  obtenerInfoResiduo(tipo: string) {
    return this.tiposResiduos[tipo] || {
      nombre: tipo,
      puntosPorKg: 10,
      icono: 'inventory_2'
    };
  }

  calcularPuntosEstimados(deposito: DepositoDTO): number {
    const info = this.obtenerInfoResiduo(deposito.tiporesiduo);
    return Math.floor(info.puntosPorKg * Number(deposito.cantidad));
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  obtenerColorEstado(estado: string): string {
    switch(estado) {
      case 'Pendiente': return 'accent';
      case 'Aprobado': return 'primary';
      case 'Rechazado': return 'warn';
      default: return '';
    }
  }

  obtenerIconoEstado(estado: string): string {
    switch(estado) {
      case 'Pendiente': return 'schedule';
      case 'Aprobado': return 'check_circle';
      case 'Rechazado': return 'cancel';
      default: return 'help';
    }
  }

  contarPorEstado(estado: string): number {
    return this.depositos.filter(d => d.estado === estado).length;
  }

  // ✅ NUEVO: Obtener nombre completo del usuario
  obtenerNombreUsuario(deposito: DepositoDTO): string {
    if (deposito.usuario) {
      return `${deposito.usuario.nombre} ${deposito.usuario.apellidos}`;
    }
    return `Usuario #${deposito.idUsuario}`;
  }

  // ✅ NUEVO: Obtener imágenes del depósito
  obtenerImagenes(pruebas: string): string[] {
    if (!pruebas) return [];
    return pruebas.split('|||').filter(img => img.trim());
  }

  // ✅ NUEVO: Ver imagen en modal
  verImagen(imagen: string) {
    this.imagenSeleccionada = imagen;
    this.modalImagen = true;
  }

  cerrarModalImagen() {
    this.modalImagen = false;
    this.imagenSeleccionada = '';
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
