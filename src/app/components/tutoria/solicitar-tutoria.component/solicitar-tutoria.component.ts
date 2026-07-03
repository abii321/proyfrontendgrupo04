import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TutoriaService } from '../../../services/tutoria.service';
import { MercadoPagoService } from '../../../services/mercadoPago.service';

@Component({
  selector: 'solicitar-tutoria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './solicitar-tutoria.component.html'
})
export class SolicitarTutoriaComponent implements OnInit {
  
  nuevaTutoria = {
  alumno_id: 1, // Simulación: ID del usuario logueado
  profesor_id: null,
  categoria_id: null,
  fecha_hora: '',
  precio: 0,
  estado: 'pendiente'
};

  categorias: any[] = [];
  profesores: any[] = [];
  archivoAdjunto: File | null = null;

    constructor(
    private tutoriaService: TutoriaService,
    private mercadoPagoService: MercadoPagoService
  ) {}

  ngOnInit() {
    // Datos simulados para probar la vista sin backend
    this.categorias = [
      { id: 1, nombre: 'Matemáticas Discretas' },
      { id: 2, nombre: 'Programación Web' },
      { id: 3, nombre: 'Bases de Datos' }
    ];

    this.profesores = [
      { id: 1, nombre: 'Juan Pérez', precioHora: 1500 },
      { id: 2, nombre: 'María Gómez', precioHora: 2000 },
      { id: 3, nombre: 'Carlos López', precioHora: 1800 }
    ];
  }

   seleccionarProfesor() {

    const profesor = this.profesores.find(
      p => p.id == this.nuevaTutoria.profesor_id
    );

    if (profesor) {
      this.nuevaTutoria.precio = profesor.precioHora;
    }

  }

  capturarArchivo(event: any) {

    this.archivoAdjunto = event.target.files[0];
  }

   enviarSolicitud() {

    this.tutoriaService.solicitarTutoria(this.nuevaTutoria).subscribe({

      next: (respuesta: any) => {

        const tutoriaCreada = respuesta.data;

        this.mercadoPagoService.crearPreferencia(tutoriaCreada.id)
          .subscribe({

            next: (pago: any) => {

              window.location.href = pago.init_point;

            },

            error: (error) => {

              console.error(error);
              alert('Error al generar el pago.');

            }

          });

      },

      error: (error) => {

        console.error(error);
        alert('Error al solicitar la tutoría.');

      }

    });

  }

}