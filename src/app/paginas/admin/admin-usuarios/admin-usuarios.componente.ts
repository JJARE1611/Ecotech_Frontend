import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../../services/usuario.service';
import { UsuarioDTO } from '../../../models/usuario.model';
import { HistorialService } from '../../../services/historial.service';

// Angular Material Imports
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';

interface EstadisticasUsuario {
  puntosDisponibles: number;
}

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatChipsModule
  ],
  templateUrl: './admin-usuarios.componente.html',
  styleUrl: './admin-usuarios.componente.css'
})
export class AdminUsuariosComponent implements OnInit {
  usuarios: UsuarioDTO[] = [];
  usuariosFiltrados: UsuarioDTO[] = [];

  // Filtros
  busqueda: string = '';

  // Estados
  cargando = true;
  error = '';

  // Modal de detalle
  modalDetalle = false;
  usuarioSeleccionado: UsuarioDTO | null = null;
  estadisticasUsuario: EstadisticasUsuario | null = null;
  cargandoEstadisticas = false;

  // Modal de edición
  modalEdicion = false;
  usuarioEditando: UsuarioDTO | null = null;
  guardando = false;
  errorFormulario = '';

  // Formulario de edición
  nombre: string = '';
  apellidos: string = '';
  telefono: string = '';
  direccion: string = '';

  constructor(
    private usuarioService: UsuarioService,
    private historialService: HistorialService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.cargando = true;
    this.error = '';

    this.usuarioService.listarUsuarios().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.error = 'No se pudieron cargar los usuarios';
        this.cargando = false;
        this.mostrarMensaje('Error al cargar usuarios', 'error');
      }
    });
  }

  aplicarFiltros() {
    if (!this.busqueda) {
      this.usuariosFiltrados = [...this.usuarios];
      return;
    }

    this.usuariosFiltrados = this.usuarios.filter(u =>
      u.email.toLowerCase().includes(this.busqueda.toLowerCase()) ||
      u.nombre.toLowerCase().includes(this.busqueda.toLowerCase()) ||
      u.apellidos.toLowerCase().includes(this.busqueda.toLowerCase())
    );
  }

  verDetalle(usuario: UsuarioDTO) {
    this.usuarioSeleccionado = usuario;
    this.modalDetalle = true;
    if (usuario.id) {
      this.cargarEstadisticasUsuario(usuario.id);
    }
  }

  cargarEstadisticasUsuario(idUsuario: number) {
    this.cargandoEstadisticas = true;
    this.estadisticasUsuario = null;

    this.historialService.obtenerPuntosDisponibles(idUsuario).subscribe({
      next: (puntos) => {
        this.estadisticasUsuario = {
          puntosDisponibles: puntos
        };
        this.cargandoEstadisticas = false;
      },
      error: (error) => {
        console.error('Error al cargar puntos:', error);
        this.estadisticasUsuario = {
          puntosDisponibles: 0
        };
        this.cargandoEstadisticas = false;
      }
    });
  }

  cerrarModalDetalle() {
    this.modalDetalle = false;
    this.usuarioSeleccionado = null;
    this.estadisticasUsuario = null;
  }

  abrirModalEdicion(usuario: UsuarioDTO) {
    this.usuarioEditando = usuario;
    this.nombre = usuario.nombre;
    this.apellidos = usuario.apellidos;
    this.telefono = usuario.telefono;
    this.direccion = usuario.direccion;
    this.modalEdicion = true;
  }

  cerrarModalEdicion() {
    this.modalEdicion = false;
    this.usuarioEditando = null;
    this.errorFormulario = '';
    this.limpiarFormulario();
  }

  limpiarFormulario() {
    this.nombre = '';
    this.apellidos = '';
    this.telefono = '';
    this.direccion = '';
  }

  validarFormulario(): boolean {
    if (!this.nombre || !this.apellidos || !this.telefono || !this.direccion) {
      this.errorFormulario = 'Todos los campos son obligatorios';
      return false;
    }
    return true;
  }

  guardarUsuario() {
    if (!this.usuarioEditando?.id) return;

    if (!this.validarFormulario()) return;

    this.guardando = true;
    this.errorFormulario = '';

    const datosActualizados: UsuarioDTO = {
      nombre: this.nombre,
      apellidos: this.apellidos,
      telefono: this.telefono,
      direccion: this.direccion,
      email: this.usuarioEditando.email
    };

    this.usuarioService.actualizarPerfil(
      this.usuarioEditando.id,
      datosActualizados
    ).subscribe({
      next: () => {
        this.mostrarMensaje('Usuario actualizado exitosamente', 'success');
        this.cargarUsuarios();
        this.cerrarModalEdicion();
        this.guardando = false;
      },
      error: (error) => {
        console.error('Error al actualizar:', error);
        this.errorFormulario = 'Error al actualizar el usuario';
        this.guardando = false;
        this.mostrarMensaje('Error al actualizar el usuario', 'error');
      }
    });
  }

  eliminarUsuario(usuario: UsuarioDTO) {
    if (!usuario.id) return;

    if (!confirm(`¿Estás seguro de eliminar al usuario "${usuario.email}"?\n\n⚠️ ESTA ACCIÓN NO SE PUEDE DESHACER.\n\nSe eliminarán todos sus datos, historial y puntos.`)) {
      return;
    }

    this.usuarioService.eliminarCuenta(usuario.id).subscribe({
      next: () => {
        this.mostrarMensaje('Usuario eliminado exitosamente', 'success');
        this.cargarUsuarios();
      },
      error: (error) => {
        console.error('Error al eliminar:', error);
        this.mostrarMensaje(
          'Error al eliminar el usuario: ' + (error.error || error.message),
          'error'
        );
      }
    });
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
