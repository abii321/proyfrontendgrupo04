import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'solicitar-tutoria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './solicitar-tutoria.component.html'
})
export class SolicitarTutoriaComponent implements OnInit {
  
  nuevaTutoria = {
    alumno_id: 1, // ID fijo de prueba
    profesor_id: null,
    categoria_id: null,
    fecha_hora: '',
    estado: 'pendiente'
  };

  categorias: any[] = [];
  profesores: any[] = [];
  archivoAdjunto: File | null = null;

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

  capturarArchivo(event: any) {
    this.archivoAdjunto = event.target.files[0];
  }

  enviarSolicitud() {
    console.log('Enviando datos (Simulación):', this.nuevaTutoria);
    alert('¡Tutoría solicitada con éxito! (Modo prueba sin backend)');
  }
}