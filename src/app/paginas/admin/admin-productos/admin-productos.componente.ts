import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { ProductoService } from '../../../services/producto.service';
import { ProductoDTO, CrearProductoDTO } from '../../../models/producto.model';

// Angular Material Imports
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-admin-productos',
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
    MatDialogModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatIconModule,
    MatTooltipModule,
    MatBadgeModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './admin-productos.componente.html',
  styleUrl: './admin-productos.componente.css'
})
export class AdminProductosComponent implements OnInit {
  productos: ProductoDTO[] = [];
  cargando = true;
  error = '';

  // Modal
  modalAbierto = false;
  modoEdicion = false;
  productoEditando: ProductoDTO | null = null;

  // Formulario
  nombre = '';
  descripcion = '';
  fechaControl = new FormControl(new Date());
  fecha = '';
  puntosrequerido = 0;
  stock = 0;
  precioReferencia: number | null = null;
  categoria = '';
  imagen = '';
  estado = 'activo';
  permiteEntregaDigital = false;

  // NUEVAS PROPIEDADES PARA UPLOAD
  archivoSeleccionado: File | null = null;
  imagenPreview: string | null = null;
  subiendoImagen = false;

  // Guardando
  guardando = false;
  errorFormulario = '';

  // Filtros
  filtroCategoria = '';
  filtroEstado = '';

  categoriasDisponibles = ['Accesorios', 'Hogar', 'Tecnología', 'Sostenible'];
  estadosDisponibles = ['activo', 'agotado', 'inactivo'];

  constructor(
    private productoService: ProductoService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.cargarProductos();
  }

  cargarProductos() {
    this.cargando = true;
    this.error = '';

    this.productoService.listarProductos().subscribe({
      next: (productos) => {
        this.productos = productos.sort((a, b) => a.puntosrequerido - b.puntosrequerido);
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.error = 'No se pudieron cargar los productos';
        this.cargando = false;
        this.mostrarMensaje('Error al cargar productos', 'error');
      }
    });
  }

  // ============================================
  // NUEVOS MÉTODOS PARA MANEJO DE ARCHIVOS
  // ============================================

  onArchivoSeleccionado(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const archivo = input.files[0];

    // Validar que sea una imagen
    if (!archivo.type.startsWith('image/')) {
      this.mostrarMensaje('Por favor selecciona un archivo de imagen', 'error');
      return;
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB en bytes
    if (archivo.size > maxSize) {
      this.mostrarMensaje('La imagen no debe superar los 5MB', 'error');
      return;
    }

    this.archivoSeleccionado = archivo;

    // Crear vista previa
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      this.imagenPreview = e.target?.result as string;
    };
    reader.readAsDataURL(archivo);

    this.mostrarMensaje('Imagen cargada correctamente', 'success');
  }

  eliminarImagen() {
    this.archivoSeleccionado = null;
    this.imagenPreview = null;
    this.imagen = '';

    // Limpiar el input file
    const fileInput = document.getElementById('imagenProductoInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  abrirSelectorArchivos() {
    const fileInput = document.getElementById('imagenProductoInput') as HTMLInputElement;
    fileInput?.click();
  }

  // Método para convertir archivo a Base64
  private convertirArchivoABase64(archivo: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve(reader.result as string);
      };

      reader.onerror = () => {
        reject(new Error('Error al leer el archivo'));
      };

      reader.readAsDataURL(archivo);
    });
  }

  // ============================================
  // MÉTODOS EXISTENTES (CON AJUSTES)
  // ============================================

  aplicarFiltros() {
    this.cargando = true;
    this.error = '';

    if (!this.filtroCategoria && !this.filtroEstado) {
      this.cargarProductos();
      return;
    }

    this.productoService.filtrarProductos(
      this.filtroCategoria || undefined,
      this.filtroEstado || undefined
    ).subscribe({
      next: (productos) => {
        this.productos = productos.sort((a, b) => a.puntosrequerido - b.puntosrequerido);
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al filtrar productos:', error);
        this.error = 'Error al filtrar productos';
        this.cargando = false;
        this.mostrarMensaje('Error al filtrar productos', 'error');
      }
    });
  }

  limpiarFiltros() {
    this.filtroCategoria = '';
    this.filtroEstado = '';
    this.cargarProductos();
  }

  abrirModalCrear() {
    this.modoEdicion = false;
    this.productoEditando = null;
    this.limpiarFormulario();
    const today = new Date();
    this.fechaControl.setValue(today);
    this.fecha = today.toISOString().split('T')[0];
    this.estado = 'activo';
    this.modalAbierto = true;
  }

  abrirModalEditar(producto: ProductoDTO) {
    this.modoEdicion = true;
    this.productoEditando = producto;
    this.cargarDatosFormulario(producto);
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.limpiarFormulario();
    this.errorFormulario = '';
  }

  limpiarFormulario() {
    this.nombre = '';
    this.descripcion = '';
    this.fechaControl.setValue(new Date());
    this.fecha = '';
    this.puntosrequerido = 0;
    this.stock = 0;
    this.precioReferencia = null;
    this.categoria = '';
    this.imagen = '';
    this.estado = 'activo';
    this.permiteEntregaDigital = false;

    // Limpiar imagen
    this.archivoSeleccionado = null;
    this.imagenPreview = null;
  }

  cargarDatosFormulario(producto: ProductoDTO) {
    this.nombre = producto.nombre;
    this.descripcion = producto.descripcion;
    const fechaDate = new Date(producto.fecha);
    this.fechaControl.setValue(fechaDate);
    this.fecha = producto.fecha;
    this.puntosrequerido = producto.puntosrequerido;
    this.stock = producto.stock;
    this.precioReferencia = producto.precioReferencia || null;
    this.categoria = producto.categoria || '';
    this.imagen = producto.imagen || '';
    this.estado = producto.estado;
    this.permiteEntregaDigital = producto.permiteEntregaDigital || false;

    // Si ya tiene imagen, mostrar preview
    if (producto.imagen) {
      this.imagenPreview = producto.imagen;
    }
  }

  async guardarProducto() {
    this.errorFormulario = '';

    // Convertir la fecha del DatePicker a string
    if (this.fechaControl.value) {
      this.fecha = new Date(this.fechaControl.value).toISOString().split('T')[0];
    }

    if (!this.validarFormulario()) {
      return;
    }

    this.guardando = true;

    // Si hay un archivo seleccionado, convertirlo a Base64
    if (this.archivoSeleccionado) {
      try {
        this.subiendoImagen = true;
        this.imagen = await this.convertirArchivoABase64(this.archivoSeleccionado);
        this.subiendoImagen = false;
      } catch (error) {
        this.errorFormulario = 'Error al procesar la imagen';
        this.guardando = false;
        this.subiendoImagen = false;
        this.mostrarMensaje('Error al procesar la imagen', 'error');
        return;
      }
    }

    const productoData: CrearProductoDTO = {
      nombre: this.nombre,
      descripcion: this.descripcion,
      fecha: this.fecha,
      puntosrequerido: this.puntosrequerido,
      stock: this.stock,
      precioReferencia: this.precioReferencia || undefined,
      categoria: this.categoria || undefined,
      imagen: this.imagen || undefined,
      estado: this.estado,
      permiteEntregaDigital: this.permiteEntregaDigital
    };

    if (this.modoEdicion && this.productoEditando) {
      this.productoService.actualizarProducto(this.productoEditando.id!, productoData).subscribe({
        next: () => {
          this.mostrarMensaje('Producto actualizado exitosamente', 'success');
          this.cargarProductos();
          this.cerrarModal();
          this.guardando = false;
        },
        error: (error) => {
          this.errorFormulario = error.error || 'Error al actualizar el producto';
          this.guardando = false;
          this.mostrarMensaje('Error al actualizar el producto', 'error');
        }
      });
    } else {
      this.productoService.crearProducto(productoData).subscribe({
        next: () => {
          this.mostrarMensaje('Producto creado exitosamente', 'success');
          this.cargarProductos();
          this.cerrarModal();
          this.guardando = false;
        },
        error: (error) => {
          this.errorFormulario = error.error || 'Error al crear el producto';
          this.guardando = false;
          this.mostrarMensaje('Error al crear el producto', 'error');
        }
      });
    }
  }

  validarFormulario(): boolean {
    if (!this.nombre || !this.descripcion || !this.fecha) {
      this.errorFormulario = 'Los campos nombre, descripción y fecha son obligatorios';
      return false;
    }

    if (this.puntosrequerido <= 0) {
      this.errorFormulario = 'Los puntos deben ser mayor a 0';
      return false;
    }

    if (this.stock < 0) {
      this.errorFormulario = 'El stock no puede ser negativo';
      return false;
    }

    if (this.precioReferencia !== null && this.precioReferencia < 0) {
      this.errorFormulario = 'El precio de referencia no puede ser negativo';
      return false;
    }

    return true;
  }

  eliminarProducto(producto: ProductoDTO) {
    if (confirm(`¿Estás seguro de eliminar el producto "${producto.nombre}"?\n\nEsta acción no se puede deshacer.`)) {
      this.productoService.eliminarProducto(producto.id!).subscribe({
        next: () => {
          this.mostrarMensaje('Producto eliminado exitosamente', 'success');
          this.cargarProductos();
        },
        error: () => {
          this.mostrarMensaje('Error al eliminar el producto', 'error');
        }
      });
    }
  }

  cambiarEstadoRapido(producto: ProductoDTO, nuevoEstado: string) {
    if (confirm(`¿Cambiar el estado de "${producto.nombre}" a "${nuevoEstado}"?`)) {
      this.productoService.cambiarEstado(producto.id!, nuevoEstado).subscribe({
        next: () => {
          this.mostrarMensaje('Estado actualizado exitosamente', 'success');
          this.cargarProductos();
        },
        error: () => {
          this.mostrarMensaje('Error al cambiar el estado', 'error');
        }
      });
    }
  }

  actualizarStockRapido(producto: ProductoDTO) {
    const nuevoStock = prompt(`Stock actual: ${producto.stock}\n\nIngrese el nuevo stock:`, producto.stock.toString());

    if (nuevoStock !== null) {
      const stockNumero = parseInt(nuevoStock, 10);

      if (isNaN(stockNumero) || stockNumero < 0) {
        this.mostrarMensaje('Por favor ingrese un número válido', 'error');
        return;
      }

      this.productoService.actualizarStock(producto.id!, stockNumero).subscribe({
        next: () => {
          this.mostrarMensaje('Stock actualizado exitosamente', 'success');
          this.cargarProductos();
        },
        error: () => {
          this.mostrarMensaje('Error al actualizar el stock', 'error');
        }
      });
    }
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  formatearPrecio(precio: number | undefined): string {
    if (!precio) return 'No especificado';
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(precio);
  }

  obtenerColorEstado(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'activo': return 'primary';
      case 'agotado': return 'accent';
      case 'inactivo': return 'warn';
      default: return '';
    }
  }

  obtenerIconoEstado(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'activo': return 'check_circle';
      case 'agotado': return 'warning';
      case 'inactivo': return 'cancel';
      default: return 'help';
    }
  }

  obtenerIconoEntregaDigital(permiteDigital?: boolean): string {
    return permiteDigital ? 'computer' : 'local_shipping';
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
