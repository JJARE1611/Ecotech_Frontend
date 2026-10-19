import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

// Angular Material Imports
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-login',
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
    MatCheckboxModule,
    MatDividerModule
  ],
  templateUrl: './login.componente.html',
  styleUrl: './login.componente.css'
})
export class LoginComponent {
  email = '';
  contrasena = '';
  mantenerSesion = false;

  error = '';
  cargando = false;
  ocultarContrasena = true;

  returnUrl: string = '/';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.error = '';


    if (!this.email || !this.contrasena) {
      this.error = 'Por favor ingresa email y contraseña';
      return;
    }

    this.cargando = true;

    this.authService.login(this.email, this.contrasena).subscribe({
      next: (response) => {
        console.log('Login exitoso:', response);
        console.log('Token JWT:', response.jwt);
        console.log('Roles:', response.roles);

        // Redirigir según el rol
        if (response.roles.includes('ROLE_ADMIN')) {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate([this.returnUrl]);
        }
      },
      error: (error) => {
        console.error('Error en login:', error);
        this.error = this.obtenerMensajeError(error);
        this.cargando = false;
      },
      complete: () => {
        this.cargando = false;
      }
    });
  }

  private obtenerMensajeError(error: any): string {
    if (error.status === 401 || error.status === 403) {
      return 'Email o contraseña incorrectos';
    } else if (error.status === 0) {
      return 'No se pudo conectar con el servidor';
    }
    return 'Error al iniciar sesión. Intenta nuevamente.';
  }
}
