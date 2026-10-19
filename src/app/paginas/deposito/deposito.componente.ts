import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DepositoService } from '../../services/deposito.service';
import { AuthService } from '../../services/auth.service';
import { DepositoDTO, TipoResiduo } from '../../models/deposito.model';
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-deposito',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDividerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule
  ],
  templateUrl: './deposito.componente.html',
  styleUrl: './deposito.componente.css'
})
export class DepositoComponent implements OnInit {
  usuarioActual: UsuarioActual | null = null;
  misDepositos: DepositoDTO[] = [];
  depositoActual: DepositoDTO | null = null;
  indiceActual: number = 0;

  // Tipos de residuos
  tiposResiduos: TipoResiduo[] = [
    {
      id: 'organico',
      nombre: 'Residuo Orgánico',
      puntosPorKg: 10,
      icono: 'compost',
      ejemplos: 'Restos de comida, cáscaras, etc.'
    },
    {
      id: 'plastico',
      nombre: 'Residuo Plástico',
      puntosPorKg: 20,
      icono: 'local_drink',
      ejemplos: 'Botellas, bolsas, envases, etc.'
    },
    {
      id: 'metalico',
      nombre: 'Residuo Metálico',
      puntosPorKg: 30,
      icono: 'delete',
      ejemplos: 'Latas, chatarra ligera, etc.'
    },
    {
      id: 'electronico',
      nombre: 'Residuo Electrónico y baterías',
      puntosPorKg: 50,
      icono: 'battery_charging_full',
      ejemplos: 'Pilas, celulares, cables, cargadores, etc.'
    }
  ];

  // Columnas de la tabla
  displayedColumns: string[] = ['tipo', 'ejemplos', 'puntos'];

  // Formulario
  formulario: DepositoDTO = {
    idUsuario: 0,
    ubicacion: '',
    fechaenvio: new Date().toISOString().split('T')[0],
    descripcion: '',
    tiporesiduo: '',
    ubicaciondeposito: '',
    pruebas: '',
    cantidad: 0,
    puntosotorgados: 0,
    estado: 'Pendiente'
  };

  fechaControl = new FormControl(new Date());

  // Estados
  cargando = false;
  enviando = false;
  editando = false;
  depositoEditandoId: number | null = null;
  error = '';

  // ✅ NUEVO: Para manejar imágenes
  imagenesSeleccionadas: File[] = [];
  previewsImagenes: string[] = [];

  modalImagen: boolean = false;
  imagenSeleccionada: string = '';


  constructor(
    private depositoService: DepositoService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.usuarioActual = this.authService.obtenerUsuario();

    if (this.usuarioActual?.idusuario) {
      this.formulario.idUsuario = this.usuarioActual.idusuario;
      this.cargarMisDepositos();
    }
  }

  cargarMisDepositos() {
    if (!this.usuarioActual?.idusuario) return;

    this.cargando = true;

    this.depositoService.obtenerDepositosUsuario(this.usuarioActual.idusuario).subscribe({
      next: (depositos) => {
        this.misDepositos = depositos.sort((a, b) =>
          new Date(b.fechaenvio).getTime() - new Date(a.fechaenvio).getTime()
        );
        if (this.misDepositos.length > 0) {
          this.depositoActual = this.misDepositos[0];
          this.indiceActual = 0;
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar depósitos:', error);
        this.cargando = false;
        this.mostrarMensaje('Error al cargar depósitos', 'error');
      }
    });
  }

  // ✅ NUEVO: Método mejorado para manejar imágenes
  onFileChange(event: any) {
    const files: FileList = event.target.files;

    if (!files || files.length === 0) return;

    // Validar que sean imágenes
    const archivosValidos: File[] = [];
    const archivosInvalidos: string[] = [];

    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) {
        archivosInvalidos.push(file.name);
      } else if (file.size > 5 * 1024 * 1024) { // Máximo 5MB por imagen
        archivosInvalidos.push(`${file.name} (excede 5MB)`);
      } else {
        archivosValidos.push(file);
      }
    });

    if (archivosInvalidos.length > 0) {
      this.mostrarMensaje(
        `Archivos no válidos: ${archivosInvalidos.join(', ')}`,
        'error'
      );
    }

    if (archivosValidos.length === 0) return;

    // Guardar archivos y generar previsualizaciones
    this.imagenesSeleccionadas = archivosValidos;
    this.previewsImagenes = [];

    archivosValidos.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewsImagenes.push(e.target.result);
      };
      reader.readAsDataURL(file);
    });

    this.mostrarMensaje(
      `${archivosValidos.length} imagen(es) seleccionada(s)`,
      'success'
    );
  }

  // ✅ NUEVO: Eliminar imagen de la selección
  eliminarImagen(index: number) {
    this.imagenesSeleccionadas.splice(index, 1);
    this.previewsImagenes.splice(index, 1);
  }

  // ✅ ACTUALIZADO: Convertir imágenes a Base64
  private async convertirImagenesABase64(): Promise<string> {
    if (this.imagenesSeleccionadas.length === 0) {
      return '';
    }

    const imagenesBase64: string[] = [];

    for (const file of this.imagenesSeleccionadas) {
      try {
        const base64 = await this.convertirArchivoABase64(file);
        imagenesBase64.push(base64);
      } catch (error) {
        console.error('Error al convertir imagen:', error);
      }
    }

    // Unir todas las imágenes separadas por un delimitador
    return imagenesBase64.join('|||');
  }

  private convertirArchivoABase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => resolve(e.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  async enviarReporte() {
    if (!this.validarFormulario()) {
      this.mostrarMensaje('Por favor completa todos los campos requeridos', 'error');
      return;
    }

    // Convertir fecha del DatePicker
    if (this.fechaControl.value) {
      this.formulario.fechaenvio = new Date(this.fechaControl.value).toISOString().split('T')[0];
    }

    // ✅ NUEVO: Convertir imágenes a Base64
    try {
      this.formulario.pruebas = await this.convertirImagenesABase64();
    } catch (error) {
      console.error('Error al procesar imágenes:', error);
      this.mostrarMensaje('Error al procesar las imágenes', 'error');
      return;
    }

    this.enviando = true;
    this.error = '';

    if (this.editando && this.depositoEditandoId) {
      this.depositoService.actualizarDeposito(this.depositoEditandoId, this.formulario).subscribe({
        next: () => {
          this.mostrarMensaje('¡Reporte actualizado exitosamente!', 'success');
          this.resetFormulario();
          this.cargarMisDepositos();
          this.enviando = false;
        },
        error: (error) => {
          console.error('❌ Error al actualizar:', error);
          this.mostrarMensaje('Error al actualizar el reporte', 'error');
          this.enviando = false;
        }
      });
    } else {
      this.depositoService.registrarDeposito(this.formulario).subscribe({
        next: () => {
          this.mostrarMensaje('¡Reporte enviado exitosamente! Tu reporte está en estado Pendiente y será revisado por un administrador.', 'success');
          this.resetFormulario();
          this.cargarMisDepositos();
          this.enviando = false;
        },
        error: (error) => {
          console.error('❌ Error al registrar:', error);
          this.error = error.error || 'Error al enviar el reporte';
          this.mostrarMensaje(this.error, 'error');
          this.enviando = false;
        }
      });
    }
  }

  validarFormulario(): boolean {
    return !!(
      this.formulario.ubicacion &&
      this.formulario.descripcion &&
      this.formulario.tiporesiduo &&
      this.formulario.ubicaciondeposito &&
      this.formulario.cantidad > 0
    );
  }

  resetFormulario() {
    this.formulario = {
      idUsuario: this.usuarioActual?.idusuario || 0,
      ubicacion: '',
      fechaenvio: new Date().toISOString().split('T')[0],
      descripcion: '',
      tiporesiduo: '',
      ubicaciondeposito: '',
      pruebas: '',
      cantidad: 0,
      puntosotorgados: 0,
      estado: 'Pendiente'
    };
    this.fechaControl.setValue(new Date());
    this.imagenesSeleccionadas = [];
    this.previewsImagenes = [];
    this.editando = false;
    this.depositoEditandoId = null;
  }

  editarReporte(deposito: DepositoDTO) {
    if (deposito.estado !== 'Pendiente') {
      this.mostrarMensaje('Solo puedes editar reportes en estado Pendiente', 'error');
      return;
    }

    this.editando = true;
    this.depositoEditandoId = deposito.id || null;
    this.formulario = { ...deposito };
    this.fechaControl.setValue(new Date(deposito.fechaenvio));

    // ✅ NUEVO: Cargar imágenes existentes para preview
    if (deposito.pruebas) {
      this.previewsImagenes = deposito.pruebas.split('|||').filter(img => img.trim());
      this.imagenesSeleccionadas = []; // No hay File objects para edición
    }

    // Scroll al formulario
    setTimeout(() => {
      document.querySelector('.seccion-reportar')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  cancelarEdicion() {
    this.resetFormulario();
  }

  siguienteDeposito() {
    if (this.indiceActual < this.misDepositos.length - 1) {
      this.indiceActual++;
      this.depositoActual = this.misDepositos[this.indiceActual];
    }
  }

  anteriorDeposito() {
    if (this.indiceActual > 0) {
      this.indiceActual--;
      this.depositoActual = this.misDepositos[this.indiceActual];
    }
  }

  obtenerIconoResiduo(tipo: string): string {
    const residuo = this.tiposResiduos.find(r => r.id === tipo);
    return residuo?.icono || 'inventory_2';
  }

  obtenerNombreResiduo(tipo: string): string {
    const residuo = this.tiposResiduos.find(r => r.id === tipo);
    return residuo?.nombre || tipo;
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  obtenerColorEstado(estado: string): string {
    switch(estado) {
      case 'Pendiente': return 'warn';
      case 'Aprobado': return 'primary';
      case 'Rechazado': return 'accent';
      default: return '';
    }
  }

  calcularPuntosEstimados(): number {
    const residuo = this.tiposResiduos.find(r => r.id === this.formulario.tiporesiduo);
    if (residuo && this.formulario.cantidad) {
      return Math.floor(residuo.puntosPorKg * this.formulario.cantidad);
    }
    return 0;
  }

  verImagenCompleta(imagen: string) {
    this.imagenSeleccionada = imagen;
    this.modalImagen = true;
  }

  cerrarModalImagen() {
    this.modalImagen = false;
    this.imagenSeleccionada = '';
  }

  // ✅ NUEVO: Obtener imágenes del depósito actual
  obtenerImagenesDeposito(pruebas: string): string[] {
    if (!pruebas) return [];
    return pruebas.split('|||').filter(img => img.trim());
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
