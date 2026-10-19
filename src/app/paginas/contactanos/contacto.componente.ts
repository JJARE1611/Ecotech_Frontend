import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contactanos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contacto.componente.html',
  styleUrl: './contacto.componente.css'
})
export class ContactanosComponent {

  onSubmit(event: Event) {
    event.preventDefault();
    console.log('Formulario enviado');
    // Aquí conectarás con tu backend más adelante
    alert('¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.');
  }
}
