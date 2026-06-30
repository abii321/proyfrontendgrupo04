import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Agregamos esto para arreglar ngIf, ngFor, date y uppercase
import { TutoriaService } from '../../../services/tutoria.service';

@Component({
  selector: 'app-gestionar-tutorias',
  standalone: true,
  imports: [CommonModule], // ¡Acá le damos las herramientas!
  templateUrl: './gestionar-tutorias.component.html'
})
export class GestionarTutoriasComponent implements OnInit {
  
  listaTutorias: any[] = [];

  constructor(private tutoriaService: TutoriaService) {}

  ngOnInit() {
    this.cargarTutorias();
  }

  cargarTutorias() {
    this.tutoriaService.obtenerTutorias().subscribe({
      next: (res: any) => {
        this.listaTutorias = res.data; 
      },
      error: (err: any) => console.error(err)
    });
  }

  aceptarTutoria(tutoria: any) {
    const actualizacion = { ...tutoria, estado: 'aceptada' };

    this.tutoriaService.responderTutoria(tutoria.id, actualizacion).subscribe({
      next: (res: any) => {
        alert('Tutoría aceptada. ¡Evento creado en Calendar!');
        tutoria.estado = 'aceptada';
        tutoria.enlace_meet = res.enlace_meet; 
      },
      error: (err: any) => alert('Hubo un error al aceptar la tutoría.')
    });
  }
  rechazarTutoria(tutoria: any) {
    // 1. Pedimos confirmación antes de hacer la acción
    const confirmar = confirm('¿Estás seguro de que querés rechazar esta solicitud de tutoría?');
    
    if (confirmar) {
      // 2. Preparamos el objeto con el estado actualizado a 'rechazada'
      const actualizacion = { ...tutoria, estado: 'rechazada' };

      // 3. Enviamos la petición al backend
      this.tutoriaService.responderTutoria(tutoria.id, actualizacion).subscribe({
        next: (res: any) => {
          alert('La tutoría fue rechazada.');
          
          // 4. Actualizamos el estado visualmente para que desaparezcan los botones en el HTML
          tutoria.estado = 'rechazada'; 
        },
        error: (err: any) => {
          console.error('Error al rechazar:', err);
          alert('Hubo un error al intentar rechazar la tutoría.');
        }
      });
    }
  }
}