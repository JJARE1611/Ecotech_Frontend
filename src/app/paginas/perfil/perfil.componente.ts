import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UsuarioService } from '../../services/usuario.service';
import { SuscripcionService } from '../../services/suscripcion.service';
import { UsuarioDTO, ActualizarPerfilDTO } from '../../models/usuario.model';
import { SuscripcionDTO } from '../../models/suscripcion.model';
import { UsuarioActual } from '../../models/auth.model';

// Angular Material Imports
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDividerModule
  ],
  templateUrl: './perfil.componente.html',
  styleUrl: './perfil.componente.css'
})
export class PerfilComponent implements OnInit {
  usuarioActual: UsuarioActual | null = null;
  perfilCompleto: UsuarioDTO | null = null;
  suscripcionActiva: SuscripcionDTO | null = null;

  // Estados
  cargando = true;
  error = '';
  editando = false;

  // Datos del formulario
  nombre = '';
  apellidos = '';
  telefono = '';
  direccion = '';
  fotoPerfil = '';

  // Para subir foto
  archivoFoto: File | null = null;
  previsualizacionFoto = '';

  // Modal de cambio de contraseña
  modalContrasenaAbierto = false;
  contrasenaActual = '';
  contrasenaNueva = '';
  confirmarContrasena = '';
  cargandoContrasena = false;
  errorContrasena = '';

  constructor(
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private suscripcionService: SuscripcionService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.usuarioActual = this.authService.obtenerUsuario();

    if (!this.usuarioActual) {
      this.router.navigate(['/login']);
      return;
    }

    this.cargarPerfil();
  }

  cargarPerfil() {
    this.cargando = true;
    this.error = '';

    if (this.usuarioActual?.idusuario) {
      this.usuarioService.obtenerPerfil(this.usuarioActual.idusuario).subscribe({
        next: (perfil) => {
          this.perfilCompleto = perfil;
          this.cargarDatosFormulario();
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al cargar perfil:', error);
          this.error = 'No se pudo cargar el perfil';
          this.cargando = false;
          this.mostrarMensaje('Error al cargar el perfil', 'error');
        }
      });

      this.suscripcionService.obtenerSuscripcionActual(this.usuarioActual.idusuario).subscribe({
        next: (suscripcion) => {
          this.suscripcionActiva = suscripcion;
        },
        error: () => {
          this.suscripcionActiva = null;
        }
      });
    }
  }

  cargarDatosFormulario() {
    if (this.perfilCompleto) {
      this.nombre = this.perfilCompleto.nombre;
      this.apellidos = this.perfilCompleto.apellidos;
      this.telefono = this.perfilCompleto.telefono;
      this.direccion = this.perfilCompleto.direccion;
      this.fotoPerfil = this.perfilCompleto.fotoPerfil || '';
      this.previsualizacionFoto = this.fotoPerfil;
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        this.mostrarMensaje('Por favor selecciona una imagen válida', 'error');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.mostrarMensaje('La imagen no debe superar los 5MB', 'error');
        return;
      }

      this.archivoFoto = file;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previsualizacionFoto = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  private convertirImagenABase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => resolve(e.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  activarEdicion() {
    this.editando = true;
  }

  cancelarEdicion() {
    this.editando = false;
    this.cargarDatosFormulario();
    this.archivoFoto = null;
  }

  async guardarCambios() {
    if (!this.perfilCompleto?.id) {
      this.mostrarMensaje('Error: No se puede actualizar el perfil', 'error');
      return;
    }

    if (!this.nombre || !this.apellidos || !this.telefono || !this.direccion) {
      this.mostrarMensaje('Todos los campos son obligatorios', 'error');
      return;
    }

    this.cargando = true;

    let fotoBase64 = this.fotoPerfil;
    if (this.archivoFoto) {
      try {
        fotoBase64 = await this.convertirImagenABase64(this.archivoFoto);
      } catch (error) {
        console.error('Error al convertir imagen:', error);
        this.mostrarMensaje('Error al procesar la imagen', 'error');
        this.cargando = false;
        return;
      }
    }

    const datosActualizar: ActualizarPerfilDTO = {
      nombre: this.nombre,
      apellidos: this.apellidos,
      telefono: this.telefono,
      direccion: this.direccion,
      fotoPerfil: fotoBase64
    };

    this.usuarioService.actualizarPerfil(this.perfilCompleto.id, datosActualizar).subscribe({
      next: (perfilActualizado) => {
        this.perfilCompleto = perfilActualizado;
        this.editando = false;
        this.cargando = false;
        this.archivoFoto = null;
        this.mostrarMensaje('¡Perfil actualizado con éxito!', 'success');
      },
      error: (error) => {
        console.error('Error al actualizar:', error);
        this.mostrarMensaje('Error al actualizar el perfil', 'error');
        this.cargando = false;
      }
    });
  }

  abrirModalContrasena() {
    this.modalContrasenaAbierto = true;
    this.contrasenaActual = '';
    this.contrasenaNueva = '';
    this.confirmarContrasena = '';
    this.errorContrasena = '';
  }

  cerrarModalContrasena() {
    this.modalContrasenaAbierto = false;
    this.errorContrasena = '';
  }

  cambiarContrasena() {
    this.errorContrasena = '';

    if (!this.contrasenaActual || !this.contrasenaNueva || !this.confirmarContrasena) {
      this.errorContrasena = 'Todos los campos son obligatorios';
      return;
    }

    if (this.contrasenaNueva !== this.confirmarContrasena) {
      this.errorContrasena = 'Las contraseñas nuevas no coinciden';
      return;
    }

    if (this.contrasenaNueva.length < 6) {
      this.errorContrasena = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    if (!this.perfilCompleto?.id) {
      this.errorContrasena = 'Error al cambiar contraseña';
      return;
    }

    this.cargandoContrasena = true;

    this.usuarioService.cambiarContrasena(this.perfilCompleto.id, {
      contrasenaActual: this.contrasenaActual,
      contrasenaNueva: this.contrasenaNueva
    }).subscribe({
      next: () => {
        this.mostrarMensaje('¡Contraseña actualizada con éxito!', 'success');
        this.cerrarModalContrasena();
        this.cargandoContrasena = false;
      },
      error: (error) => {
        console.error('Error al cambiar contraseña:', error);
        this.errorContrasena = error.error || 'Error al cambiar la contraseña';
        this.cargandoContrasena = false;
      }
    });
  }

  irASuscripcion() {
    this.router.navigate(['/suscripcion']);
  }

  get nombreCompleto(): string {
    if (this.perfilCompleto) {
      return `${this.perfilCompleto.nombre} ${this.perfilCompleto.apellidos}`;
    }
    return '';
  }

  get nombrePlan(): string {
    return this.suscripcionActiva?.tipoplan || 'Básico';
  }

  get iconoPlan(): string {
    const plan = this.suscripcionActiva?.tipoplan?.toLowerCase();
    if (plan === 'vip') return 'workspace_premium';
    if (plan === 'premium') return 'star';
    return 'eco';
  }

  get colorPlan(): string {
    const plan = this.suscripcionActiva?.tipoplan?.toLowerCase();
    if (plan === 'vip') return 'accent';
    if (plan === 'premium') return 'warn';
    return 'primary';
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
