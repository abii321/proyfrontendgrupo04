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

    if (!tutoria.pagada) {

      alert('La tutoría aún no fue abonada.');

      return;

    }

    const actualizacion = {

      ...tutoria,

      estado: 'aceptada'

    };

    this.tutoriaService.responderTutoria(
      tutoria.id,
      actualizacion
    ).subscribe({

      next: (res: any) => {

        tutoria.estado = 'aceptada';
        tutoria.enlace_meet = res.enlace_meet;

        alert('Tutoría aceptada correctamente.');

      },

      error: (err: any) => {

        console.error(err);

        alert('Error al aceptar la tutoría.');

      }

    });

  }
  rechazarTutoria(tutoria: any) {

    const confirmar = confirm(
      '¿Deseás rechazar esta tutoría?'
    );

    if (!confirmar) return;

    const actualizacion = {

      ...tutoria,

      estado: 'rechazada'

    };

    this.tutoriaService.responderTutoria(
      tutoria.id,
      actualizacion
    ).subscribe({

      next: () => {

        tutoria.estado = 'rechazada';

        alert('Tutoría rechazada.');

      },

      error: (err: any) => {

        console.error(err);

        alert('Error al rechazar la tutoría.');

      }

    });

  }

}
