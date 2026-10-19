import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { EventoService } from '../../../services/evento.service';
import { EventoDTO, CrearEventoDTO, UsuarioEventoDTO } from '../../../models/evento.model';

// Angular Material Imports
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
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
  selector: 'app-admin-eventos',
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
  templateUrl: './admin-eventos.componente.html',
  styleUrl: './admin-eventos.componente.css'
})
export class AdminEventosComponent implements OnInit {
  eventos: EventoDTO[] = [];
  cargando = true;
  error = '';

  // Modal Evento
  modalAbierto = false;
  modoEdicion = false;
  eventoEditando: EventoDTO | null = null;

  // Modal Participantes
  modalParticipantes = false;
  participantesEvento: UsuarioEventoDTO[] = [];
  eventoSeleccionado: EventoDTO | null = null;
  cargandoParticipantes = false;

  // Formulario
  nombre = '';
  descripcion = '';
  fechaControl = new FormControl(new Date());
  fecha = '';
  lugar = '';
  puntos = 0;
  horaInicio = '';
  horaFin = '';
  capacidadMaxima: number | null = null;
  estadoEvento = 'programado';
  categoria = '';
  imagenBanner = '';
  tipoEvento = 'publico';

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

  categoriasDisponibles = ['Reciclaje', 'Limpieza', 'Plantación', 'Educación'];
  estadosDisponibles = ['programado', 'en curso', 'finalizado'];
  tiposEventoDisponibles = ['publico', 'premium', 'vip'];

  constructor(
    private eventoService: EventoService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.cargarEventos();
  }

  cargarEventos() {
    this.cargando = true;
    this.error = '';

    this.eventoService.listarEventos().subscribe({
      next: (eventos) => {
        this.eventos = eventos.sort((a, b) =>
          new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        );
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar eventos:', error);
        this.error = 'No se pudieron cargar los eventos';
        this.cargando = false;
        this.mostrarMensaje('Error al cargar eventos', 'error');
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
    this.imagenBanner = '';

    // Limpiar el input file
    const fileInput = document.getElementById('imagenBannerInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  abrirSelectorArchivos() {
    const fileInput = document.getElementById('imagenBannerInput') as HTMLInputElement;
    fileInput?.click();
  }

  // ============================================
  // MÉTODOS EXISTENTES (CON AJUSTES MENORES)
  // ============================================

  aplicarFiltros() {
    this.cargando = true;
    this.error = '';

    if (!this.filtroCategoria && !this.filtroEstado) {
      this.cargarEventos();
      return;
    }

    this.eventoService.filtrarEventos(
      this.filtroCategoria || undefined,
      this.filtroEstado || undefined
    ).subscribe({
      next: (eventos) => {
        this.eventos = eventos.sort((a, b) =>
          new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        );
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al filtrar eventos:', error);
        this.error = 'Error al filtrar eventos';
        this.cargando = false;
        this.mostrarMensaje('Error al filtrar eventos', 'error');
      }
    });
  }

  limpiarFiltros() {
    this.filtroCategoria = '';
    this.filtroEstado = '';
    this.cargarEventos();
  }

  abrirModalCrear() {
    this.modoEdicion = false;
    this.eventoEditando = null;
    this.limpiarFormulario();
    const today = new Date();
    this.fechaControl.setValue(today);
    this.fecha = today.toISOString().split('T')[0];
    this.estadoEvento = 'programado';
    this.tipoEvento = 'publico';
    this.modalAbierto = true;
  }

  abrirModalEditar(evento: EventoDTO) {
    this.modoEdicion = true;
    this.eventoEditando = evento;
    this.cargarDatosFormulario(evento);
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
    this.lugar = '';
    this.puntos = 0;
    this.horaInicio = '';
    this.horaFin = '';
    this.capacidadMaxima = null;
    this.estadoEvento = 'programado';
    this.categoria = '';
    this.imagenBanner = '';
    this.tipoEvento = 'publico';

    // Limpiar imagen
    this.archivoSeleccionado = null;
    this.imagenPreview = null;
  }

  cargarDatosFormulario(evento: EventoDTO) {
    this.nombre = evento.nombre;
    this.descripcion = evento.descripcion;
    const fechaDate = new Date(evento.fecha);
    this.fechaControl.setValue(fechaDate);
    this.fecha = evento.fecha;
    this.lugar = evento.lugar;
    this.puntos = evento.puntos;
    this.horaInicio = evento.horaInicio || '';
    this.horaFin = evento.horaFin || '';
    this.capacidadMaxima = evento.capacidadMaxima || null;
    this.estadoEvento = evento.estadoEvento;
    this.categoria = evento.categoria || '';
    this.imagenBanner = evento.imagenBanner || '';
    this.tipoEvento = evento.tipoEvento || 'publico';

    // Si ya tiene imagen, mostrar preview
    if (evento.imagenBanner) {
      this.imagenPreview = evento.imagenBanner;
    }
  }

  async guardarEvento() {
    this.errorFormulario = '';

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
        this.imagenBanner = await this.convertirArchivoABase64(this.archivoSeleccionado);
        this.subiendoImagen = false;
      } catch (error) {
        this.errorFormulario = 'Error al procesar la imagen';
        this.guardando = false;
        this.subiendoImagen = false;
        this.mostrarMensaje('Error al procesar la imagen', 'error');
        return;
      }
    }

    const eventoData: CrearEventoDTO = {
      nombre: this.nombre,
      descripcion: this.descripcion,
      fecha: this.fecha,
      lugar: this.lugar,
      puntos: this.puntos,
      horaInicio: this.horaInicio || undefined,
      horaFin: this.horaFin || undefined,
      capacidadMaxima: this.capacidadMaxima || undefined,
      estadoEvento: this.estadoEvento,
      categoria: this.categoria || undefined,
      imagenBanner: this.imagenBanner || undefined,
      tipoEvento: this.tipoEvento
    };

    if (this.modoEdicion && this.eventoEditando) {
      this.eventoService.actualizarEvento(this.eventoEditando.id!, eventoData).subscribe({
        next: () => {
          this.mostrarMensaje('Evento actualizado exitosamente', 'success');
          this.cargarEventos();
          this.cerrarModal();
          this.guardando = false;
        },
        error: (error) => {
          this.errorFormulario = error.error || 'Error al actualizar el evento';
          this.guardando = false;
          this.mostrarMensaje('Error al actualizar el evento', 'error');
        }
      });
    } else {
      this.eventoService.crearEvento(eventoData).subscribe({
        next: () => {
          this.mostrarMensaje('Evento creado exitosamente', 'success');
          this.cargarEventos();
          this.cerrarModal();
          this.guardando = false;
        },
        error: (error) => {
          this.errorFormulario = error.error || 'Error al crear el evento';
          this.guardando = false;
          this.mostrarMensaje('Error al crear el evento', 'error');
        }
      });
    }
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

  validarFormulario(): boolean {
    if (!this.nombre || !this.descripcion || !this.fecha || !this.lugar) {
      this.errorFormulario = 'Los campos nombre, descripción, fecha y lugar son obligatorios';
      return false;
    }

    if (!this.horaInicio || !this.horaFin) {
      this.errorFormulario = 'Las horas de inicio y fin son obligatorias';
      return false;
    }

    if (this.horaFin <= this.horaInicio) {
      this.errorFormulario = 'La hora de fin debe ser posterior a la hora de inicio';
      return false;
    }

    if (this.puntos < 0) {
      this.errorFormulario = 'Los puntos no pueden ser negativos';
      return false;
    }

    if (this.capacidadMaxima !== null && this.capacidadMaxima < 0) {
      this.errorFormulario = 'La capacidad máxima no puede ser negativa';
      return false;
    }

    return true;
  }

  eliminarEvento(evento: EventoDTO) {
    if (confirm(`¿Estás seguro de eliminar el evento "${evento.nombre}"?\n\nEsta acción no se puede deshacer.`)) {
      this.eventoService.eliminarEvento(evento.id!).subscribe({
        next: () => {
          this.mostrarMensaje('Evento eliminado exitosamente', 'success');
          this.cargarEventos();
        },
        error: () => {
          this.mostrarMensaje('Error al eliminar el evento', 'error');
        }
      });
    }
  }

  cambiarEstadoRapido(evento: EventoDTO, nuevoEstado: string) {
    if (confirm(`¿Cambiar el estado de "${evento.nombre}" a "${nuevoEstado}"?`)) {
      this.eventoService.actualizarEstadoEvento(evento.id!, nuevoEstado).subscribe({
        next: () => {
          this.mostrarMensaje('Estado actualizado exitosamente', 'success');
          this.cargarEventos();
        },
        error: () => {
          this.mostrarMensaje('Error al cambiar el estado', 'error');
        }
      });
    }
  }

  actualizarCapacidadRapida(evento: EventoDTO) {
    const capacidadActual = evento.capacidadMaxima || 'Sin límite';
    const nuevaCapacidad = prompt(
      `Capacidad actual: ${capacidadActual}\n\nIngrese la nueva capacidad máxima (deje vacío para sin límite):`,
      evento.capacidadMaxima?.toString() || ''
    );

    if (nuevaCapacidad === null) return;

    const capacidadNumero = nuevaCapacidad === '' ? 0 : parseInt(nuevaCapacidad, 10);

    if (nuevaCapacidad !== '' && (isNaN(capacidadNumero) || capacidadNumero < 0)) {
      this.mostrarMensaje('Por favor ingrese un número válido o deje vacío', 'error');
      return;
    }

    this.eventoService.actualizarCapacidad(evento.id!, capacidadNumero).subscribe({
      next: () => {
        this.mostrarMensaje('Capacidad actualizada exitosamente', 'success');
        this.cargarEventos();
      },
      error: () => {
        this.mostrarMensaje('Error al actualizar la capacidad', 'error');
      }
    });
  }

  // Modal Participantes
  verParticipantes(evento: EventoDTO) {
    this.eventoSeleccionado = evento;
    this.modalParticipantes = true;
    this.cargarParticipantes(evento.id!);
  }

  cargarParticipantes(idEvento: number) {
    this.cargandoParticipantes = true;

    this.eventoService.obtenerInscritosPorEvento(idEvento).subscribe({
      next: (participantes) => {
        this.participantesEvento = participantes;
        this.cargandoParticipantes = false;
      },
      error: (error) => {
        console.error('Error al cargar participantes:', error);
        this.mostrarMensaje('Error al cargar participantes', 'error');
        this.cargandoParticipantes = false;
      }
    });
  }

  marcarAsistencia(inscripcion: UsuarioEventoDTO, asistio: boolean) {
    if (!inscripcion.id) return;

    const mensaje = asistio
      ? '¿Confirmar que este usuario asistió al evento?\n\nSe le otorgarán los puntos correspondientes CON MULTIPLICADOR según su plan.'
      : '¿Marcar que este usuario NO asistió?';

    if (!confirm(mensaje)) return;

    this.eventoService.marcarAsistencia(inscripcion.id, asistio).subscribe({
      next: (actualizado) => {
        this.mostrarMensaje(
          asistio
            ? `Asistencia confirmada. Se otorgaron ${actualizado.puntosotorgados} puntos (incluye multiplicador del plan).`
            : 'Marcado como no asistió.',
          'success'
        );
        this.cargarParticipantes(this.eventoSeleccionado!.id!);
      },
      error: () => {
        this.mostrarMensaje('Error al marcar asistencia', 'error');
      }
    });
  }

  cerrarModalParticipantes() {
    this.modalParticipantes = false;
    this.participantesEvento = [];
    this.eventoSeleccionado = null;
  }

  // Utilidades
  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  formatearHora(hora?: string): string {
    if (!hora) return '-';
    return hora;
  }

  obtenerInfoTipoEvento(tipo?: string): { icono: string, texto: string, color: string } {
    const tipoNormalizado = tipo?.toLowerCase() || 'publico';

    switch (tipoNormalizado) {
      case 'vip':
        return { icono: '👑', texto: 'Evento VIP', color: '#9C27B0' };
      case 'premium':
        return { icono: '⭐', texto: 'Evento Premium', color: '#FF9800' };
      default:
        return { icono: '🌍', texto: 'Evento Público', color: '#4CAF50' };
    }
  }

  obtenerColorEstadoEvento(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'programado':
        return 'primary';
      case 'en curso':
        return 'accent';
      case 'finalizado':
        return 'primary';
      default:
        return '';
    }
  }

  obtenerIconoEstadoEvento(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'programado':
        return 'event';
      case 'en curso':
        return 'play_circle';
      case 'finalizado':
        return 'check_circle';
      default:
        return 'help';
    }
  }

  obtenerEstadoAsistencia(inscripcion: UsuarioEventoDTO): string {
    if (inscripcion.asistio) return 'Asistió';

    const fechaEvento = new Date(this.eventoSeleccionado!.fecha);
    const hoy = new Date();

    if (fechaEvento > hoy) return 'Pendiente';
    return 'No asistió';
  }

  obtenerColorEstadoAsistencia(inscripcion: UsuarioEventoDTO): string {
    if (inscripcion.asistio) return 'primary';

    const fechaEvento = new Date(this.eventoSeleccionado!.fecha);
    const hoy = new Date();

    if (fechaEvento > hoy) return 'accent';
    return 'warn';
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
