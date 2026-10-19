import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { EventoService } from '../../../services/evento.service';
import { UsuarioService } from '../../../services/usuario.service';
import { DepositoService } from '../../../services/deposito.service';

interface Estadistica {
  titulo: string;
  valor: number | string;
  icono: string;
  color: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatListModule
  ],
  templateUrl: './admin-dashboard.componente.html',
  styleUrl: './admin-dashboard.componente.css'
})
export class AdminDashboardComponent implements OnInit {
  estadisticas: Estadistica[] = [
    {
      titulo: 'Total Usuarios',
      valor: 0,
      icono: 'people',
      color: '#2196F3'
    },
    {
      titulo: 'Eventos Activos',
      valor: 0,
      icono: 'event',
      color: '#4CAF50'
    },
    {
      titulo: 'Productos',
      valor: 0,
      icono: 'card_giftcard',
      color: '#FF9800'
    },
    {
      titulo: 'Depósitos Totales',
      valor: 0,
      icono: 'recycling',
      color: '#9C27B0'
    }
  ];

  actividadesRecientes: any[] = [];
  cargando = true;

  constructor(
    private eventoService: EventoService,
    private usuarioService: UsuarioService,
    private depositoService: DepositoService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarEstadisticas();
  }

  cargarEstadisticas() {
    this.cargando = true;

    // Cargar eventos
    this.eventoService.listarEventos().subscribe({
      next: (eventos) => {
        const eventosActivos = eventos.filter(e => new Date(e.fecha) >= new Date());
        this.estadisticas[1].valor = eventosActivos.length;
      },
      error: (error) => console.error('Error al cargar eventos:', error)
    });

    // Cargar usuarios
    this.usuarioService.listarUsuarios().subscribe({
      next: (usuarios) => {
        this.estadisticas[0].valor = usuarios.length;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.cargando = false;
      }
    });

    // Cargar depósitos
    this.depositoService.listarTodos().subscribe({
      next: (depositos) => {
        this.estadisticas[3].valor = depositos.length;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });

    // Simular actividades recientes
    this.actividadesRecientes = [
      {
        tipo: 'usuario',
        mensaje: 'Nuevo usuario registrado',
        fecha: new Date(),
        icono: 'person_add'
      },
      {
        tipo: 'evento',
        mensaje: 'Evento "Reciclaton" creado',
        fecha: new Date(Date.now() - 3600000),
        icono: 'event_available'
      },
      {
        tipo: 'deposito',
        mensaje: 'Nueva área contaminada reportada',
        fecha: new Date(Date.now() - 7200000),
        icono: 'report'
      }
    ];
  }

  navegarA(ruta: string) {
    this.router.navigate([ruta]);
  }

  formatearFecha(fecha: Date): string {
    const ahora = new Date();
    const diff = ahora.getTime() - fecha.getTime();
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(diff / 3600000);

    if (minutos < 60) {
      return `Hace ${minutos} minutos`;
    } else if (horas < 24) {
      return `Hace ${horas} horas`;
    } else {
      return fecha.toLocaleDateString('es-ES');
    }
  }
}
