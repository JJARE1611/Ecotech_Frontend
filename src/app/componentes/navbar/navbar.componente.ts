import { Component, HostListener, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { UsuarioService } from '../../services/usuario.service';
import { UsuarioActual } from '../../models/auth.model';
import { UsuarioDTO } from '../../models/usuario.model';
import { NotificacionesComponent } from '../../paginas/notificaciones/notificaciones.componente';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, NotificacionesComponent],
  templateUrl: './navbar.componente.html',
  styleUrl: './navbar.componente.css'
})
export class NavbarComponent implements OnInit {
  isScrolled = false;
  usuario: UsuarioActual | null = null;
  perfilCompleto: UsuarioDTO | null = null;
  menuPerfilAbierto = false;

  requiereFondoFijo = false;

  private rutasConFondoFijo = [
    '/perfil',
    '/canje-ecopuntos',
    '/historial-ecopuntos',
    '/suscripcion',
    '/mis-eventos',
  ];

  constructor(
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private router: Router
  ) {
    this.authService.usuarioActual$.subscribe(user => {
      this.usuario = user;

      if (user?.idusuario) {
        this.cargarPerfilCompleto(user.idusuario);
      } else {
        this.perfilCompleto = null;
      }
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.verificarRutaActual(event.url);
    });
  }

  ngOnInit() {
    if (this.usuario?.idusuario) {
      this.cargarPerfilCompleto(this.usuario.idusuario);
    }

    this.usuarioService.perfilActualizado$.subscribe(perfilActualizado => {
      this.perfilCompleto = perfilActualizado;
      console.log(' Perfil actualizado en navbar:', perfilActualizado);
    });


    this.verificarRutaActual(this.router.url);
  }

  private verificarRutaActual(url: string) {
    this.requiereFondoFijo = this.rutasConFondoFijo.some(ruta =>
      url.startsWith(ruta)
    );
  }

  cargarPerfilCompleto(idUsuario: number) {
    this.usuarioService.obtenerPerfil(idUsuario).subscribe({
      next: (perfil) => {
        this.perfilCompleto = perfil;
        console.log(' Perfil completo cargado en navbar:', perfil);
      },
      error: (error) => {
        console.error(' Error al cargar perfil en navbar:', error);
      }
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const clickedInside = target.closest('.perfil-menu');

    if (!clickedInside && this.menuPerfilAbierto) {
      this.menuPerfilAbierto = false;
    }
  }

  toggleMenuPerfil(event: Event) {
    event.stopPropagation();
    this.menuPerfilAbierto = !this.menuPerfilAbierto;
  }

  navegarA(ruta: string) {
    this.menuPerfilAbierto = false;
    this.router.navigate([ruta]);
  }

  logout() {
    this.menuPerfilAbierto = false;
    if (confirm('¿Estás seguro de cerrar sesión?')) {
      this.authService.logout();
    }
  }

  esAdmin(): boolean {
    return this.authService.esAdmin();
  }

  get fotoPerfil(): string | null {
    return this.perfilCompleto?.fotoPerfil || null;
  }

  get nombreCompleto(): string {
    if (this.perfilCompleto) {
      return `${this.perfilCompleto.nombre} ${this.perfilCompleto.apellidos}`;
    }
    return this.usuario?.email.split('@')[0] || 'Usuario';
  }

  get debeVerseBackground(): boolean {
    return this.isScrolled || this.requiereFondoFijo;
  }
}
