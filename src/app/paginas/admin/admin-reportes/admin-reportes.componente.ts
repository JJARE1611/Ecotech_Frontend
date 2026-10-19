import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { ReporteService } from '../../../services/reporte.service';
import {
  EstadisticasGenerales,
  DepositoPorTipo,
  EventoParticipacion,
  UsuarioTop,
  DepositoPorMes
} from '../../../models/reporte.model';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-admin-reportes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressBarModule,
    MatTooltipModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-PE' }
  ],
  templateUrl: './admin-reportes.componente.html',
  styleUrls: ['./admin-reportes.componente.css']
})
export class AdminReportesComponent implements OnInit {
  // Estados
  cargando = true;
  error = '';

  // Filtros de fecha con FormControl
  fechaInicioControl = new FormControl(new Date());
  fechaFinControl = new FormControl(new Date());
  fechaInicio: string = '';
  fechaFin: string = '';

  // Datos de reportes
  estadisticasGenerales: EstadisticasGenerales | null = null;
  depositosPorTipo: DepositoPorTipo[] = [];
  eventosMasParticipados: EventoParticipacion[] = [];
  usuariosTop: UsuarioTop[] = [];
  depositosPorMes: DepositoPorMes[] = [];

  // Columnas para la tabla
  displayedColumns: string[] = ['ranking', 'nombre', 'email', 'puntos', 'progreso'];

  constructor(private reporteService: ReporteService) {}

  ngOnInit() {
    // Establecer rango de fecha por defecto (últimos 6 meses)
    const hoy = new Date();
    const hace6Meses = new Date();
    hace6Meses.setMonth(hace6Meses.getMonth() - 6);

    this.fechaFinControl.setValue(hoy);
    this.fechaInicioControl.setValue(hace6Meses);
    this.fechaFin = hoy.toISOString().split('T')[0];
    this.fechaInicio = hace6Meses.toISOString().split('T')[0];

    this.cargarReportes();
  }

  cargarReportes() {
    this.cargando = true;
    this.error = '';

    // Convertir FormControl a string
    if (this.fechaInicioControl.value) {
      this.fechaInicio = new Date(this.fechaInicioControl.value).toISOString().split('T')[0];
    }
    if (this.fechaFinControl.value) {
      this.fechaFin = new Date(this.fechaFinControl.value).toISOString().split('T')[0];
    }

    // Contador de peticiones completadas
    let completadas = 0;
    const totalPeticiones = 5;

    const verificarCompletado = () => {
      completadas++;
      if (completadas === totalPeticiones) {
        this.cargando = false;
      }
    };

    // Cargar estadísticas generales
    this.reporteService.obtenerEstadisticasGenerales().subscribe({
      next: (data) => {
        this.estadisticasGenerales = data;
        verificarCompletado();
      },
      error: (err) => {
        console.error('Error al cargar estadísticas generales:', err);
        this.error = 'Error al cargar algunas estadísticas';
        verificarCompletado();
      }
    });

    // Cargar depósitos por tipo
    this.reporteService.obtenerDepositosPorTipo(this.fechaInicio, this.fechaFin).subscribe({
      next: (data) => {
        this.depositosPorTipo = data;
        verificarCompletado();
      },
      error: (err) => {
        console.error('Error al cargar depósitos por tipo:', err);
        verificarCompletado();
      }
    });

    // Cargar eventos más participados
    this.reporteService.obtenerEventosMasParticipados(5).subscribe({
      next: (data) => {
        this.eventosMasParticipados = data;
        verificarCompletado();
      },
      error: (err) => {
        console.error('Error al cargar eventos:', err);
        verificarCompletado();
      }
    });

    // Cargar usuarios top
    this.reporteService.obtenerUsuariosTop(10).subscribe({
      next: (data) => {
        this.usuariosTop = data;
        verificarCompletado();
      },
      error: (err) => {
        console.error('Error al cargar usuarios top:', err);
        verificarCompletado();
      }
    });

    // Cargar depósitos por mes
    this.reporteService.obtenerDepositosPorMes(this.fechaInicio, this.fechaFin).subscribe({
      next: (data) => {
        this.depositosPorMes = data;
        verificarCompletado();
      },
      error: (err) => {
        console.error('Error al cargar depósitos por mes:', err);
        verificarCompletado();
      }
    });
  }

  aplicarFiltros() {
    if (!this.fechaInicioControl.value || !this.fechaFinControl.value) {
      this.error = 'Debe seleccionar ambas fechas';
      return;
    }

    if (new Date(this.fechaInicioControl.value) > new Date(this.fechaFinControl.value)) {
      this.error = 'La fecha de inicio no puede ser posterior a la fecha fin';
      return;
    }

    this.cargarReportes();
  }

  limpiarFiltros() {
    const hoy = new Date();
    const hace6Meses = new Date();
    hace6Meses.setMonth(hace6Meses.getMonth() - 6);

    this.fechaFinControl.setValue(hoy);
    this.fechaInicioControl.setValue(hace6Meses);
    this.fechaFin = hoy.toISOString().split('T')[0];
    this.fechaInicio = hace6Meses.toISOString().split('T')[0];

    this.cargarReportes();
  }

  // Métodos auxiliares para los gráficos
  calcularPorcentaje(valor: number, total: number): number {
    return total > 0 ? (valor / total) * 100 : 0;
  }

  obtenerColorTipo(tipo: string): string {
    const colores: { [key: string]: string } = {
      'organico': '#4CAF50',
      'plastico': '#2196F3',
      'metalico': '#FF9800',
      'electronico': '#9C27B0'
    };
    return colores[tipo] || '#757575';
  }

  obtenerIconoTipo(tipo: string): string {
    const iconos: { [key: string]: string } = {
      'organico': 'compost',
      'plastico': 'recycling',
      'metalico': 'delete',
      'electronico': 'power'
    };
    return iconos[tipo] || 'inventory_2';
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  formatearNumero(num: number): string {
    return new Intl.NumberFormat('es-ES').format(num);
  }

  formatearMes(mes: string): string {
    // Formato: "2024-11" -> "Nov 2024"
    const [year, month] = mes.split('-');
    const fecha = new Date(parseInt(year), parseInt(month) - 1);
    return fecha.toLocaleDateString('es-ES', {
      month: 'short',
      year: 'numeric'
    });
  }

  calcularTotalDepositos(): number {
    return this.depositosPorTipo.reduce((sum, d) => sum + d.cantidad, 0);
  }

  calcularTotalPeso(): number {
    return this.depositosPorTipo.reduce((sum, d) => sum + d.peso, 0);
  }

  obtenerMaximoParticipantes(): number {
    if (this.eventosMasParticipados.length === 0) return 0;
    return Math.max(...this.eventosMasParticipados.map(e => e.participantes));
  }

  obtenerMaximoPuntos(): number {
    if (this.usuariosTop.length === 0) return 0;
    return Math.max(...this.usuariosTop.map(u => u.puntos));
  }

  obtenerMaximaCantidadMes(): number {
    if (this.depositosPorMes.length === 0) return 0;
    return Math.max(...this.depositosPorMes.map(d => d.cantidad));
  }

  obtenerMedallaRanking(index: number): string {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return '';
  }
}
