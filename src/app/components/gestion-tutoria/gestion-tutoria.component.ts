import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TutoriaService } from '../../services/tutoria.service'; // Ajustá esta ruta si es necesario

@Component({
  selector: 'app-gestion-tutoria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-tutoria.component.html',
  styleUrls: ['./gestion-tutoria.component.css']
})
export class GestionTutoriaComponent implements OnInit {

  rol: string = '';
  // Simulamos al profesor seleccionado 
  profesorSeleccionado = {
    id: 2, // ID importante para la base de datos
    nombre: 'María Gómez',
    tarifaBase: 2000,
    categorias: ['Programación Web', 'Bases de Datos'],
    categoriaId: 1 // ID de la categoría para guardar en BD
  };

  // Ahora arranca vacío, se llena con la base de datos
  horariosProfesor: any[] = [];

  solicitud = {
    modalidad: 'virtual',
    fechaHora: '',
    mensaje: ''
  };

  errorDisponibilidad: string = '';
  nuevoHorario = { diaSemana: 'lunes', horaInicio: '', horaFin: '' };

  // INYECTAMOS EL SERVICIO 
  constructor(private tutoriaService: TutoriaService) { }

  ngOnInit() {
    //  Lee el rol del usuario que inició sesión
    const usuarioString = localStorage.getItem('usuarioLogueado');
console.log("1. Texto en localStorage:", usuarioString);
    if (usuarioString) {
      const usuario = JSON.parse(usuarioString);

      console.log("2. Objeto usuario detectado:", usuario); 
      console.log("3. El rol específico es:", usuario.rol);

      this.rol = usuario.rol; // 'alumno' o 'profesor'
    } else {
      
      console.log("No se encontró 'usuarioLogueado' en localStorage.");
      
      this.rol = 'alumno'; // Por defecto si no hay nadie logueado
    }
    
    console.log("4. ROL FINAL ASIGNADO A LA VISTA:", this.rol);

    this.cargarHorariosReales();
  }

  cargarHorariosReales() {
    this.tutoriaService.obtenerHorariosProfesor(this.profesorSeleccionado.id).subscribe({
      next: (res) => {
        if (res.status === 1) {
          this.horariosProfesor = res.data;
        }
      },
      error: (err) => console.error('Error al cargar horarios', err)
    });
  }

  get precioFinal(): number {
    return this.solicitud.modalidad === 'presencial'
      ? this.profesorSeleccionado.tarifaBase * 1.2
      : this.profesorSeleccionado.tarifaBase;
  }

  obtenerDiaSemana(fecha: Date): string {
    const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    return dias[fecha.getDay()];
  }

  validarHorario() {
    if (!this.solicitud.fechaHora) return;

    const fechaElegida = new Date(this.solicitud.fechaHora);
    const diaElegido = this.obtenerDiaSemana(fechaElegida);

    const horas = fechaElegida.getHours().toString().padStart(2, '0');
    const minutos = fechaElegida.getMinutes().toString().padStart(2, '0');
    const horaElegidaStr = `${horas}:${minutos}`;

    const horarioValido = this.horariosProfesor.find(h =>
      h.dia_semana === diaElegido && // Ajustado para que coincida con la propiedad del backend
      horaElegidaStr >= h.hora_inicio && // (hora_inicio)
      horaElegidaStr <= h.hora_fin // (hora_fin)
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

    // Armamos el objeto exacto que espera el backend para guardar la tutoría
    const datosParaBD = {
      alumno_id: 1, // ID de quien está logueado
      profesor_id: this.profesorSeleccionado.id,
      categoria_id: this.profesorSeleccionado.categoriaId,
      modalidad: this.solicitud.modalidad,
      precio_acordado: this.precioFinal,
      mensaje: this.solicitud.mensaje,
      fecha_hora: this.solicitud.fechaHora
    };

    this.tutoriaService.solicitarTutoria(datosParaBD).subscribe({
      next: (res) => {
        alert(`¡Tutoría agendada en la base de datos! Total a abonar: $${this.precioFinal}`);
        // REDIRECCIONAR a MercadoPago
      },
      error: (err) => {
        console.error('Error al solicitar:', err);
        alert('Hubo un error al guardar la tutoría.');
      }
    });
  }

  // --- LÓGICA PROFESOR ---

  agregarHorario() {
    if (this.nuevoHorario.diaSemana && this.nuevoHorario.horaInicio && this.nuevoHorario.horaFin) {

      const datosParaBD = {
        profesor_id: this.profesorSeleccionado.id,
        dia_semana: this.nuevoHorario.diaSemana,
        hora_inicio: this.nuevoHorario.horaInicio,
        hora_fin: this.nuevoHorario.horaFin
      };

      this.tutoriaService.crearHorario(datosParaBD).subscribe({
        next: (res) => {
          if (res.status === 1) {
            // Agregamos a la vista el horario real que devolvió la BD (con su ID)
            this.horariosProfesor.push(res.data);
            // Limpiamos los campitos
            this.nuevoHorario = { diaSemana: 'lunes', horaInicio: '', horaFin: '' };
          }
        },
        error: (err) => console.error('Error al guardar horario:', err)
      });
    }
  }

  eliminarHorario(index: number, idHorario: number) {
    if (!idHorario) return;

    this.tutoriaService.eliminarHorario(idHorario).subscribe({
      next: (res) => {
        if (res.status === 1) {
          // Lo sacamos de la pantalla SOLO si la base de datos confirmó que lo borró
          this.horariosProfesor.splice(index, 1);
        }
      },
      error: (err) => console.error('Error al eliminar horario:', err)
    });
  }
}