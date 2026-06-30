import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Agregamos esto
import { FormsModule } from '@angular/forms'; // Agregamos esto para arreglar el ngModel
import { TutoriaService } from '../../../services/tutoria.service';

@Component({
  selector: 'app-solicitar-tutoria',
  standalone: true, // Esto indica que es un componente moderno
  imports: [CommonModule, FormsModule], // ¡Acá le damos las herramientas!
  templateUrl: './solicitar-tutoria.component.html'
})
export class SolicitarTutoriaComponent {
  
  nuevaTutoria = {
    alumno_id: 1, 
    profesor_id: null,
    categoria_id: null,
    fecha_hora: '',
    estado: 'pendiente'
  };

  constructor(private tutoriaService: TutoriaService) {}

  enviarSolicitud() {
    this.tutoriaService.solicitarTutoria(this.nuevaTutoria).subscribe({
      next: (res: any) => {
        alert('¡Tutoría solicitada con éxito!');
      },
      error: (err: any) => console.error('Error al solicitar:', err)
    });
  }
}