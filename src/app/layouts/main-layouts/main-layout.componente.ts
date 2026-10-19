import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../componentes/navbar/navbar.componente';
import { FooterComponent } from '../../componentes/footer/footer.componente';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './main-layout.componente.html',
})
export class MainLayoutComponent {}
