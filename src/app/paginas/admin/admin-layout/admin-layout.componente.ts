import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../services/auth.service';
import { UsuarioActual } from '../../../models/auth.model';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterOutlet,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatDividerModule
  ],
  templateUrl: './admin-layout.componente.html',
  styleUrls: ['./admin-layout.componente.css']
})
export class AdminLayoutComponent implements OnInit {
  usuarioActual: UsuarioActual | null = null;
  menuAbierto = true;

  menuItems = [
    {
      titulo: 'Dashboard',
      icono: 'dashboard',
      ruta: '/admin/dashboard',
      activo: false
    },
    {
      titulo: 'Gestión de Eventos',
      icono: 'event',
      ruta: '/admin/eventos',
      activo: false
    },
    {
      titulo: 'Gestión de Productos',
      icono: 'card_giftcard',
      ruta: '/admin/productos',
      activo: false
    },
    {
      titulo: 'Usuarios',
      icono: 'people',
      ruta: '/admin/usuarios',
      activo: false
    },
    {
      titulo: 'Depósitos',
      icono: 'recycling',
      ruta: '/admin/depositos',
      activo: false
    },
    {
      titulo: 'Reportes',
      icono: 'trending_up',
      ruta: '/admin/reportes',
      activo: false
    },
    {
      titulo: 'Canje',
      icono: 'swap_horiz',
      ruta: '/admin/canjes',
      activo: false
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.usuarioActual = this.authService.obtenerUsuario();

    // Verificar que sea admin
    if (!this.authService.esAdmin()) {
      alert('No tienes permisos para acceder a esta sección');
      this.router.navigate(['/']);
    }
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  volverAlSitio() {
    this.router.navigate(['/']);
  }

  cerrarSesion() {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
      this.authService.logout();
    }
  }

  isRutaActiva(ruta: string): boolean {
    return this.router.url === ruta;
  }
}
