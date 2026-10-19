import { Routes } from '@angular/router';
import { AuthLayoutComponent} from './layouts/auth-layouts/auth-layout.componente';
import { MainLayoutComponent} from './layouts/main-layouts/main-layout.componente';
import { HomeComponent } from './paginas/home/home.componente';
import { ConsejosComponent } from './paginas/consejos/consejos.componente';
import { ContactanosComponent} from './paginas/contactanos/contacto.componente';
import { RegistroComponent } from './paginas/registro/registro.componente';
import { LoginComponent } from './paginas/login/login.componente';
import { DepositoComponent } from './paginas/deposito/deposito.componente';
import {authGuard} from './guards/auth-guard';
import {PerfilComponent} from './paginas/perfil/perfil.componente';
import {adminGuard} from './guards/admin-guard';
import {EventosComponent} from './paginas/evento/eventos.componente';
import {AdminEventosComponent} from './paginas/admin/admin-eventos/admin-eventos.componente';
import {AdminDashboardComponent} from './paginas/admin/admin-dashboard/admin-dashboard.componente';
import {AdminProductosComponent} from './paginas/admin/admin-productos/admin-productos.componente';
import {EventoInscripcionComponent} from './paginas/evento-inscripcion/evento-inscripcion.componente';
import {MisEventosComponent} from './paginas/mis-eventos/mis-eventos.componente';
import {CanjeEcopuntosComponent} from './paginas/canje/canje.componente';
import {HistorialEcopuntosComponent} from './paginas/Historial-Puntos/historial.componente';
import {SuscripcionComponent} from './paginas/Suscripcion/suscripcion.componente';
import {AdminDepositosComponent} from './paginas/admin/admin-depositos/admin-depositos.componente';
import {AdminUsuariosComponent} from './paginas/admin/admin-usuarios/admin-usuarios.componente';
import {AdminReportesComponent} from './paginas/admin/admin-reportes/admin-reportes.componente';
import {EventoFeedbackComponent} from './paginas/evento-feedback/evento-feedback.componente';
import {EventoFeedbacksListaComponent} from './paginas/evento-feedbacks-lista/evento-feedbacks-lista.componente';
import {AdminCanjesComponent} from './paginas/admin/admin-canjes/admin-canjes.componente';
import {AdminLayoutComponent} from './paginas/admin/admin-layout/admin-layout.componente';


export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'consejos', component: ConsejosComponent },
      { path: 'contactanos', component: ContactanosComponent },
      { path: 'eventos', component: EventosComponent },
      {
        path: 'deposito',
        component: DepositoComponent,
        canActivate: [authGuard]
      },
      {
        path: 'eventos/:id/inscribirse',
        component: EventoInscripcionComponent,
        canActivate: [authGuard]
      },
      {
        path: 'mis-eventos',
        component: MisEventosComponent,
        canActivate: [authGuard]
      },
      {
        path: 'perfil',
        component: PerfilComponent,
        canActivate: [authGuard]
      },
      {
        path: 'canje-ecopuntos',
        component: CanjeEcopuntosComponent,
        canActivate: [authGuard]
      },
      {
        path: 'historial-ecopuntos',
        component: HistorialEcopuntosComponent,
        canActivate: [authGuard]
      },
      {
        path: 'suscripcion',
        component: SuscripcionComponent,
        canActivate: [authGuard]
      },
      {
        path: 'eventos/:id/feedback',
        component: EventoFeedbackComponent,
        canActivate: [authGuard]
      },
      {
        path: 'eventos/:id/opiniones',
        component: EventoFeedbacksListaComponent,
        canActivate: [authGuard]
      },
    ]
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,   // 👈 Aquí ya no depende de MainLayout
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'eventos', component: AdminEventosComponent },
      { path: 'productos', component: AdminProductosComponent },
      { path: 'depositos', component: AdminDepositosComponent },
      { path: 'usuarios', component: AdminUsuariosComponent },
      { path: 'reportes', component: AdminReportesComponent },
      { path: 'canjes', component: AdminCanjesComponent },
    ]
  },
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'registro', component: RegistroComponent },
    ]
  },
  { path: '**', redirectTo: '' }
];

