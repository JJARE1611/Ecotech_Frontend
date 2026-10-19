import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HistorialService } from '../../services/historial.service';
import { AuthService } from '../../services/auth.service';
import { HistorialPuntosDTO } from '../../models/historial.model';
import { UsuarioActual } from '../../models/auth.model';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-historial-ecopuntos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './historial.componente.html',
  styleUrl: './historial.componente.css'
})
export class HistorialEcopuntosComponent implements OnInit {
  historial: HistorialPuntosDTO[] = [];
  historialFiltrado: HistorialPuntosDTO[] = [];
  usuarioActual: UsuarioActual | null = null;

  puntosDisponibles: number = 0;
  totalObtenidos: number = 0;
  totalCanjeados: number = 0;


  filtroTipo: string = 'todos';
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;


  cargando = true;
  error = '';

  constructor(
    private historialService: HistorialService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.usuarioActual = this.authService.obtenerUsuario();

    if (!this.usuarioActual) {
      alert('Debes iniciar sesión');
      this.router.navigate(['/login']);
      return;
    }

    if (this.usuarioActual.idusuario) {
      this.cargarHistorial();
      this.cargarPuntosDisponibles();
    }
  }

  cargarHistorial() {
    if (!this.usuarioActual?.idusuario) return;

    this.cargando = true;
    this.error = '';

    this.historialService.obtenerHistorialUsuario(this.usuarioActual.idusuario).subscribe({
      next: (historial) => {
        console.log('✅ Historial cargado:', historial);
        this.historial = historial.sort((a, b) =>
          new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        );
        this.historialFiltrado = this.historial;
        this.calcularTotales();
        this.cargando = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar historial:', error);
        this.error = 'No se pudo cargar el historial';
        this.cargando = false;
      }
    });
  }

  cargarPuntosDisponibles() {
    if (!this.usuarioActual?.idusuario) return;

    this.historialService.obtenerPuntosDisponibles(this.usuarioActual.idusuario).subscribe({
      next: (puntos) => {
        console.log('✅ Puntos disponibles:', puntos);
        this.puntosDisponibles = puntos;
      },
      error: (error) => {
        console.error('❌ Error al cargar puntos:', error);
      }
    });
  }

  calcularTotales() {
    this.totalObtenidos = this.historial.reduce(
      (sum, item) => sum + item.puntosobtenidos,
      0
    );
    this.totalCanjeados = this.historial.reduce(
      (sum, item) => sum + item.puntoscanjeados,
      0
    );
  }

  aplicarFiltros() {
    let resultado = [...this.historial];

    if (this.filtroTipo !== 'todos') {
      resultado = resultado.filter(item => item.tipomovimiento === this.filtroTipo);
    }

    if (this.fechaInicio && this.fechaFin) {
      if (!this.usuarioActual?.idusuario) return;

      const fechaInicioStr = this.fechaInicio.toISOString().split('T')[0];
      const fechaFinStr = this.fechaFin.toISOString().split('T')[0];

      this.historialService.obtenerHistorialPorFechas(
        this.usuarioActual.idusuario,
        fechaInicioStr,
        fechaFinStr
      ).subscribe({
        next: (historial) => {
          console.log('Historial filtrado:', historial);
          this.historialFiltrado = historial;

          if (this.filtroTipo !== 'todos') {
            this.historialFiltrado = this.historialFiltrado.filter(
              item => item.tipomovimiento === this.filtroTipo
            );
          }
        },
        error: (error) => {
          console.error('❌ Error:', error);
        }
      });
    } else {
      this.historialFiltrado = resultado;
    }
  }

  limpiarFiltros() {
    this.filtroTipo = 'todos';
    this.fechaInicio = null;
    this.fechaFin = null;
    this.historialFiltrado = this.historial;
  }

  obtenerIconoTipo(tipo: string): string {
    switch(tipo) {
      case 'Deposito': return 'recycling';
      case 'Evento': return 'event';
      case 'Canje': return 'shopping_cart';
      default: return 'description';
    }
  }

  obtenerColorTipo(tipo: string): string {
    switch(tipo) {
      case 'Deposito': return 'deposito';
      case 'Evento': return 'evento';
      case 'Canje': return 'canje';
      default: return '';
    }
  }

  obtenerColorChip(tipo: string): 'primary' | 'accent' | 'warn' | undefined {
    switch(tipo) {
      case 'Deposito': return 'primary';
      case 'Evento': return 'accent';
      case 'Canje': return 'warn';
      default: return undefined;
    }
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  formatearFechaCorta(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  exportarCSV() {
    const headers = ['Fecha', 'Tipo', 'Descripción', 'Puntos Obtenidos', 'Puntos Canjeados'];
    const rows = this.historialFiltrado.map(item => [
      this.formatearFechaCorta(item.fecha),
      item.tipomovimiento,
      item.descripcion,
      item.puntosobtenidos,
      item.puntoscanjeados
    ]);

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historial-ecopuntos-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
