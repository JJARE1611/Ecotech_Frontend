import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UsuarioRegistroDTO } from '../../models/usuario.model';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './registro.componente.html',
  styleUrl: './registro.componente.css'
})
export class RegistroComponent {

  nombre = '';
  apellidos = '';
  email = '';
  telefono = '';
  direccion = '';
  contrasena = '';
  confirmarContrasena = '';

  error = '';
  cargando = false;
  ocultarContrasena = true;
  ocultarConfirmarContrasena = true;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(event: Event): void {
    event.preventDefault();
    this.error = '';

    if (!this.validarFormulario()) {
      return;
    }

    this.cargando = true;


    const datosRegistro: UsuarioRegistroDTO = {
      nombre: this.nombre,
      apellidos: this.apellidos,
      email: this.email,
      telefono: this.telefono,
      direccion: this.direccion,
      contrasena: this.contrasena
    };


    this.authService.registrar(datosRegistro).subscribe({
      next: (response) => {
        console.log('Usuario registrado:', response);
        alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Error en registro:', error);
        this.error = this.obtenerMensajeError(error);
        this.cargando = false;
      },
      complete: () => {
        this.cargando = false;
      }
    });
  }

  private validarFormulario(): boolean {
    if (!this.nombre || !this.apellidos || !this.email ||
      !this.telefono || !this.direccion || !this.contrasena) {
      this.error = 'Todos los campos son obligatorios';
      return false;
    }


    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.error = 'El email no es válido';
      return false;
    }

    if (this.contrasena !== this.confirmarContrasena) {
      this.error = 'Las contraseñas no coinciden';
      return false;
    }

    if (this.contrasena.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres';
      return false;
    }

    return true;
  }

  private obtenerMensajeError(error: any): string {
    if (error.status === 400) {
      return error.error || 'Datos inválidos. Verifica la información.';
    } else if (error.status === 409) {
      return 'El email ya está registrado.';
    } else if (error.status === 0) {
      return 'No se pudo conectar con el servidor.';
    }
    return 'Error al registrar. Intenta nuevamente.';
  }
}
