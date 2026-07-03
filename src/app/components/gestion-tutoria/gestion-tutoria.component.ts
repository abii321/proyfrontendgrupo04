import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-gestion-tutoria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-tutoria.component.html',
  styleUrls: ['./gestion-tutoria.component.css']
})
export class GestionTutoriaComponent implements OnInit {
  
  // Simulamos el rol del usuario actual (cambiá a 'profesor' para ver su vista)
  rol: string = 'alumno'; 

  // --- DATOS DEL PROFESOR (Simulación del Backend) ---
  profesorSeleccionado = { 
    nombre: 'María Gómez', 
    tarifaBase: 2000,
    categorias: ['Programación Web', 'Bases de Datos']
  };

  // Estos datos vendrían de tu tabla 'horarios_disponibles'
  horariosProfesor = [
    { diaSemana: 'lunes', horaInicio: '10:00', horaFin: '14:00' },
    { diaSemana: 'miércoles', horaInicio: '15:00', horaFin: '18:00' }
  ];

  // --- VARIABLES ALUMNO ---
  solicitud = {
    modalidad: 'virtual',
    fechaHora: '',
    mensaje: ''
  };
  errorDisponibilidad: string = '';

  // --- VARIABLES PROFESOR ---
  nuevoHorario = { diaSemana: 'lunes', horaInicio: '', horaFin: '' };

  ngOnInit() {}

  // --- LÓGICA ALUMNO ---

  get precioFinal(): number {
    return this.solicitud.modalidad === 'presencial' 
      ? this.profesorSeleccionado.tarifaBase * 1.2 
      : this.profesorSeleccionado.tarifaBase;
  }

  // Traductor de fechas de JavaScript a los ENUM de tu base de datos
  obtenerDiaSemana(fecha: Date): string {
    const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    return dias[fecha.getDay()];
  }

  validarHorario() {
    if (!this.solicitud.fechaHora) return;

    const fechaElegida = new Date(this.solicitud.fechaHora);
    const diaElegido = this.obtenerDiaSemana(fechaElegida);
    
    // Extraemos la hora en formato HH:mm para comparar
    const horas = fechaElegida.getHours().toString().padStart(2, '0');
    const minutos = fechaElegida.getMinutes().toString().padStart(2, '0');
    const horaElegidaStr = `${horas}:${minutos}`;

    // Buscamos si el profesor trabaja ese día y a esa hora
    const horarioValido = this.horariosProfesor.find(h => 
      h.diaSemana === diaElegido &&
      horaElegidaStr >= h.horaInicio &&
      horaElegidaStr <= h.horaFin
    );

    if (!horarioValido) {
      this.errorDisponibilidad = `El profesor no está disponible el ${diaElegido} a las ${horaElegidaStr}. Revisá sus horarios.`;
    } else {
      this.errorDisponibilidad = '';
    }
  }

  solicitarYPagar() {
    this.validarHorario();
    if (this.errorDisponibilidad) return;

    alert(`¡Horario validado! Redirigiendo a MercadoPago para abonar $${this.precioFinal}...`);
  }

  // --- LÓGICA PROFESOR ---

  agregarHorario() {
    if (this.nuevoHorario.horaInicio && this.nuevoHorario.horaFin) {
      this.horariosProfesor.push({ ...this.nuevoHorario });
      alert('Horario guardado en la base de datos (simulación).');
    }
  }

  eliminarHorario(index: number) {
    this.horariosProfesor.splice(index, 1);
  }
}