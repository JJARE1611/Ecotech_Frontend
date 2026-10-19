import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductoService } from '../../services/producto.service';
import { CanjeService } from '../../services/canje.service';
import { AuthService } from '../../services/auth.service';
import { ProductoDTO, CanjeUsuarioDTO } from '../../models/canje.model';
import { UsuarioActual } from '../../models/auth.model';

// Angular Material Imports
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatRadioModule } from '@angular/material/radio';

@Component({
  selector: 'app-canje-ecopuntos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatBadgeModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDividerModule,
    MatRadioModule
  ],
  templateUrl: './canje.componente.html',
  styleUrl: './canje.componente.css'
})
export class CanjeEcopuntosComponent implements OnInit {
  productos: ProductoDTO[] = [];
  productosFiltrados: ProductoDTO[] = [];
  usuarioActual: UsuarioActual | null = null;
  puntosDisponibles: number = 0;

  // Beneficios del usuario
  planUsuario: string = 'Basico';
  multiplicadorPuntos: number = 1;
  descuentoCanjes: number = 0;

  // Filtros
  busqueda: string = '';
  filtroCategoria: string = '';

  // Estados
  cargando = true;
  canjeando = false;
  error = '';

  // Modal
  mostrarModal = false;
  productoSeleccionado: ProductoDTO | null = null;
  cantidadCanje = 1;
  metodoEntregaSeleccionado: string = 'físico';

  // Datos de dirección
  direccionEntrega: string = '';
  ciudad: string = '';
  codigoPostal: string = '';
  telefono: string = '';
  referencia: string = '';

  // Validación
  permiteDigital: boolean = false;

  categoriasDisponibles = ['Accesorios', 'Hogar', 'Tecnología', 'Sostenible'];
  metodosEntrega = ['digital', 'físico', 'retiro en tienda'];

  constructor(
    private productoService: ProductoService,
    private canjeService: CanjeService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.usuarioActual = this.authService.obtenerUsuario();

    if (!this.usuarioActual) {
      this.mostrarMensaje('Debes iniciar sesión para canjear productos', 'error');
      this.router.navigate(['/login']);
      return;
    }

    this.cargarBeneficiosUsuario();
    this.cargarProductos();
    this.cargarPuntosUsuario();
  }

  cargarBeneficiosUsuario() {
    if (!this.usuarioActual?.idusuario) return;

    this.canjeService.obtenerBeneficiosUsuario(this.usuarioActual.idusuario).subscribe({
      next: (beneficios) => {
        this.planUsuario = beneficios.plan || 'Basico';
        this.multiplicadorPuntos = beneficios.multiplicadorPuntos || 1;
        this.descuentoCanjes = beneficios.descuentoCanjes || 0;
      },
      error: () => {
        this.planUsuario = 'Basico';
        this.multiplicadorPuntos = 1;
        this.descuentoCanjes = 0;
      }
    });
  }

  cargarProductos() {
    this.cargando = true;
    this.error = '';

    this.productoService.listarProductosDisponibles().subscribe({
      next: (productos) => {
        this.productos = productos;
        this.productosFiltrados = productos;
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los productos';
        this.cargando = false;
        this.mostrarMensaje('Error al cargar productos', 'error');
      }
    });
  }

  cargarPuntosUsuario() {
    if (!this.usuarioActual?.idusuario) return;

    this.canjeService.obtenerPuntosUsuario(this.usuarioActual.idusuario).subscribe({
      next: (puntos) => {
        this.puntosDisponibles = puntos;
      },
      error: () => {
        this.puntosDisponibles = 0;
      }
    });
  }

  calcularPuntosConDescuento(puntosBase: number): number {
    if (this.descuentoCanjes === 0) return puntosBase;
    return Math.ceil(puntosBase * (1 - this.descuentoCanjes / 100));
  }

  calcularPuntosTotal(): number {
    if (!this.productoSeleccionado) return 0;
    const puntosConDescuento = this.calcularPuntosConDescuento(this.productoSeleccionado.puntosrequerido);
    return puntosConDescuento * this.cantidadCanje;
  }

  calcularAhorro(): number {
    if (!this.productoSeleccionado || this.descuentoCanjes === 0) return 0;
    const puntosOriginales = this.productoSeleccionado.puntosrequerido * this.cantidadCanje;
    const puntosConDescuento = this.calcularPuntosTotal();
    return puntosOriginales - puntosConDescuento;
  }

  obtenerIconoPlan(): string {
    switch (this.planUsuario) {
      case 'Premium': return 'star';
      case 'VIP': return 'workspace_premium';
      default: return 'eco';
    }
  }

  obtenerColorPlan(): string {
    switch (this.planUsuario) {
      case 'Premium': return 'warn';
      case 'VIP': return 'accent';
      default: return 'primary';
    }
  }

  filtrarProductos() {
    let resultados = [...this.productos];

    if (this.busqueda.trim()) {
      const rangoPuntos = parseInt(this.busqueda);

      if (!isNaN(rangoPuntos)) {
        resultados = resultados.filter(producto =>
          Math.abs(producto.puntosrequerido - rangoPuntos) <= 50
        );
      } else {
        resultados = resultados.filter(producto =>
          producto.nombre.toLowerCase().includes(this.busqueda.toLowerCase())
        );
      }
    }

    if (this.filtroCategoria) {
      resultados = resultados.filter(producto =>
        producto.categoria === this.filtroCategoria
      );
    }

    this.productosFiltrados = resultados;
  }

  limpiarFiltros() {
    this.busqueda = '';
    this.filtroCategoria = '';
    this.productosFiltrados = this.productos;
  }

  abrirModal(producto: ProductoDTO) {
    this.productoSeleccionado = producto;
    this.cantidadCanje = 1;
    this.metodoEntregaSeleccionado = 'físico';
    this.direccionEntrega = '';
    this.ciudad = '';
    this.codigoPostal = '';
    this.telefono = '';
    this.referencia = '';

    if (producto.id) {
      this.canjeService.permiteEntregaDigital(producto.id).subscribe({
        next: (permite) => {
          this.permiteDigital = permite;
        },
        error: () => {
          this.permiteDigital = false;
        }
      });
    }

    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.productoSeleccionado = null;
    this.cantidadCanje = 1;
    this.metodoEntregaSeleccionado = 'físico';
    this.direccionEntrega = '';
    this.ciudad = '';
    this.codigoPostal = '';
    this.telefono = '';
    this.referencia = '';
    this.permiteDigital = false;
  }

  seleccionarMetodoEntrega(metodo: string) {
    if (metodo === 'digital' && !this.permiteDigital) {
      this.mostrarMensaje('Este producto no está disponible para entrega digital', 'error');
      return;
    }
    this.metodoEntregaSeleccionado = metodo;
  }

  validarDireccion(): boolean {
    if (this.metodoEntregaSeleccionado === 'físico') {
      if (!this.direccionEntrega.trim()) {
        this.mostrarMensaje('La dirección de entrega es obligatoria', 'error');
        return false;
      }
      if (!this.ciudad.trim()) {
        this.mostrarMensaje('La ciudad es obligatoria', 'error');
        return false;
      }
      if (!this.telefono.trim()) {
        this.mostrarMensaje('El teléfono es obligatorio', 'error');
        return false;
      }
    }
    return true;
  }

  tienePuntosSuficientes(): boolean {
    return this.calcularPuntosTotal() <= this.puntosDisponibles;
  }

  tieneStockDisponible(): boolean {
    if (!this.productoSeleccionado) return false;
    return this.cantidadCanje <= this.productoSeleccionado.stock;
  }

  aumentarCantidad() {
    if (this.productoSeleccionado && this.cantidadCanje < this.productoSeleccionado.stock) {
      this.cantidadCanje++;
    }
  }

  disminuirCantidad() {
    if (this.cantidadCanje > 1) {
      this.cantidadCanje--;
    }
  }

  confirmarCanje() {
    if (!this.usuarioActual?.idusuario || !this.productoSeleccionado) {
      this.mostrarMensaje('Error: Información incompleta', 'error');
      return;
    }

    if (!this.tienePuntosSuficientes()) {
      this.mostrarMensaje('No tienes suficientes Eco-Puntos', 'error');
      return;
    }

    if (!this.tieneStockDisponible()) {
      this.mostrarMensaje('No hay suficiente stock disponible', 'error');
      return;
    }

    if (!this.validarDireccion()) {
      return;
    }

    this.canjeando = true;
    this.error = '';

    this.canjeService.validarPuntosUsuario(
      this.usuarioActual.idusuario,
      this.productoSeleccionado.id!,
      this.cantidadCanje
    ).subscribe({
      next: (tienePuntos) => {
        if (tienePuntos) {
          this.realizarCanje();
        } else {
          this.mostrarMensaje('No tienes suficientes Eco-Puntos', 'error');
          this.canjeando = false;
        }
      },
      error: () => {
        this.mostrarMensaje('Error al validar puntos', 'error');
        this.canjeando = false;
      }
    });
  }

  realizarCanje() {
    if (!this.usuarioActual?.idusuario || !this.productoSeleccionado) return;

    const canje: CanjeUsuarioDTO = {
      idUsuario: this.usuarioActual.idusuario,
      idProducto: this.productoSeleccionado.id!,
      fechacanje: new Date().toISOString().split('T')[0],
      cantidad: this.cantidadCanje,
      estadoCanje: 'pendiente',
      metodoEntrega: this.metodoEntregaSeleccionado,
      observaciones: '',
      direccionEntrega: this.direccionEntrega || undefined,
      ciudad: this.ciudad || undefined,
      codigoPostal: this.codigoPostal || undefined,
      telefono: this.telefono || undefined,
      referencia: this.referencia || undefined
    };

    this.canjeService.canjearProducto(canje).subscribe({
      next: () => {
        const mensaje = `¡Canje exitoso!\n\nProducto: ${this.productoSeleccionado?.nombre}\nCantidad: ${this.cantidadCanje}\nPuntos utilizados: ${this.calcularPuntosTotal()}`;

        if (this.descuentoCanjes > 0) {
          this.mostrarMensaje(`${mensaje}\n✨ Ahorraste ${this.calcularAhorro()} puntos con tu plan ${this.planUsuario}`, 'success');
        } else {
          this.mostrarMensaje(mensaje, 'success');
        }

        this.puntosDisponibles -= this.calcularPuntosTotal();
        this.cerrarModal();
        this.canjeando = false;
        this.cargarProductos();
      },
      error: (error) => {
        this.error = error.error || 'Error al realizar el canje';
        this.mostrarMensaje(this.error, 'error');
        this.canjeando = false;
      }
    });
  }

  verMas(producto: ProductoDTO) {
    this.mostrarMensaje(`${producto.nombre}\n\n${producto.descripcion}`, 'success');
  }

  obtenerImagenProducto(producto: ProductoDTO): string {
    return producto.imagen || 'assets/productos/producto-placeholder.png';
  }

  obtenerColorCategoria(categoria?: string): string {
    if (!categoria) return 'primary';

    const colores: { [key: string]: string } = {
      'Accesorios': 'warn',
      'Hogar': 'accent',
      'Tecnologia': 'accent',
      'Sostenible': 'primary'
    };

    return colores[categoria] || 'primary';
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
