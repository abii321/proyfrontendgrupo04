import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AutenticacionService } from '../../services/autenticacion.service';
import { TutoriaService } from '../../services/tutoria.service';
import { SolicitudService } from '../../services/solicitud-ayuda.service';
import { CalificacionService } from '../../services/calificacion.service';
import { BaseChartDirective } from 'ng2-charts';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-mis-solicitudes',
  standalone: true,
  imports: [CommonModule, RouterLink, BaseChartDirective, FormsModule],
  templateUrl: './mis-solicitudes.component.html',
  styleUrl: './mis-solicitudes.component.css',
})
export class MisSolicitudesComponent implements OnInit {
  rol: string = '';
  usuarioId: number = 0;
  nombreCompleto: string = '';
  carrera: string = '';
  universidad: string = '';

  alumnoTutoriasSolicitadas = 0;
  alumnoTutoriasCompletadas = 0;
  alumnoProximaTutoria = 'Ninguna programada';
  alumnoCategoriasConsultadas = 0;

  alumnoDonaData: any = {
    labels: ['Programación', 'Matemáticas', 'Inglés', 'Física'],
    datasets: [{ data: [0, 0, 0, 0], backgroundColor: ['#0d6efd', '#ffc107', '#198754', '#6c757d'] }]
  };

  alumnoBarrasData: any = {
    labels: ['Marzo', 'Abril', 'Mayo', 'Junio'],
    datasets: [{ data: [0, 0, 0, 0], label: 'Tutorías Solicitadas', backgroundColor: '#0d6efd', borderRadius: 4 }]
  };

  profesorTutoriasPendientes = 0;
  profesorTutoriasCompletadas = 0;
  profesorHorasDictadas = 0;
  profesorCalificacionPromedio = 5.0;
  nuevaPuntuacion: number = 0;
  nuevoComentario: string = '';

  profesorBarrasData: any = {
    labels: ['Marzo', 'Abril', 'Mayo', 'Junio'],
    datasets: [{ data: [0, 0, 0, 0], label: 'Horas Dictadas', backgroundColor: '#0d6efd', borderRadius: 4 }]
  };

  profesorDonaData: any = {
    labels: ['Excelente (5★)', 'Muy Bueno (4★)', 'Regular (3★)'],
    datasets: [{ data: [5, 0, 0], backgroundColor: ['#198754', '#ffc107', '#dc3545'] }]
  };

  chartOptionsDoughnut = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const
      }
    }
  };

  chartOptionsBar = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  misTutorias: any[] = [];
  misTareas: any[] = [];
  categorias: any[] = [];

  tutoriaSeleccionada: any = null;
  tareaSeleccionada: any = null;

  authService = inject(AutenticacionService);
  private tutoriaService = inject(TutoriaService);
  private solicitudService = inject(SolicitudService);
  private calificacionService = inject(CalificacionService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    if (!this.authService.userLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    const userStr = sessionStorage.getItem('usuario');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.rol = user.rol;
      this.usuarioId = user.id;
      this.nombreCompleto = `${user.nombre} ${user.apellido}`;
      this.carrera = user.carrera;
      this.universidad = user.universidad;
    }

    this.cargarTutorias();
    this.cargarCategorias();
    
    if (this.rol === 'alumno') {
      this.cargarTareas();
    }
  }

  cargarTutorias() {
    this.tutoriaService.obtenerTutorias().subscribe({
      next: (res: any) => {
        if (res && res.data) {
          const allTutorias = res.data || [];
          if (this.rol === 'alumno') {
            this.misTutorias = allTutorias.filter((t: any) => t.alumno_id === this.usuarioId);
            this.actualizarMetricasAlumno();
          } else if (this.rol === 'profesor') {
            this.misTutorias = allTutorias.filter((t: any) => t.profesor_id === this.usuarioId);
            this.actualizarMetricasProfesor();
          }
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al obtener tutorías:', err);
        this.cdr.detectChanges();
      }
    });
  }

  cargarTareas() {
    this.solicitudService.getSolicitudes().subscribe({
      next: (res: any) => {
        if (res && res.data) {
          const allSolicitudes = res.data || [];
          if (this.rol === 'alumno') {
            this.misTareas = allSolicitudes.filter((s: any) => s.id_usuario === this.usuarioId);
          }
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al obtener solicitudes/tareas:', err);
        this.cdr.detectChanges();
      }
    });
  }

  cargarCategorias() {
    this.solicitudService.getCategorias().subscribe({
      next: (res: any) => {
        if (res && res.data) {
          this.categorias = res.data;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar categorías:', err);
      }
    });
  }

  getNombreCategoria(id: number): string {
    const cat = this.categorias.find(c => c.id === id);
    return cat ? cat.nombre : 'Sin categoría';
  }

  actualizarMetricasAlumno() {
    this.alumnoTutoriasSolicitadas = this.misTutorias.length;
    this.alumnoTutoriasCompletadas = this.misTutorias.filter(t => t.estado === 'finalizada' || t.estado === 'completada').length;
    
    const proxima = this.misTutorias.find(t => t.estado === 'aprobada' || t.estado === 'aceptada');
    if (proxima) {
      const fecha = new Date(proxima.fecha_hora);
      this.alumnoProximaTutoria = `${fecha.toLocaleDateString()} a las ${fecha.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${proxima.categoria?.nombre || 'Tutoría'}`;
    } else {
      this.alumnoProximaTutoria = 'Ninguna programada';
    }

    const cats = this.misTutorias.map(t => t.categoria?.nombre).filter(Boolean);
    this.alumnoCategoriasConsultadas = new Set(cats).size;

    const counts: { [key: string]: number } = {};
    cats.forEach(c => counts[c] = (counts[c] || 0) + 1);

    const labels = Object.keys(counts);
    const data = Object.values(counts);

    if (labels.length > 0) {
      this.alumnoDonaData = {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: ['#0d6efd', '#ffc107', '#198754', '#6c757d', '#dc3545', '#0dcaf0']
        }]
      };
    }

    const meses = ['Marzo', 'Abril', 'Mayo', 'Junio', 'Julio'];
    const countsMes = [0, 0, 0, 0, 0];
    this.misTutorias.forEach(t => {
      const m = new Date(t.fecha_hora).getMonth();
      if (m >= 2 && m <= 6) {
        countsMes[m - 2]++;
      }
    });

    this.alumnoBarrasData = {
      labels: meses,
      datasets: [{ data: countsMes, label: 'Tutorías Solicitadas', backgroundColor: '#0d6efd', borderRadius: 4 }]
    };
  }

  actualizarMetricasProfesor() {
    this.profesorTutoriasPendientes = this.misTutorias.filter(t => t.estado === 'pendiente').length;
    this.profesorTutoriasCompletadas = this.misTutorias.filter(t => t.estado === 'finalizada' || t.estado === 'completada').length;
    this.profesorHorasDictadas = this.profesorTutoriasCompletadas;

    const tutoriasConCalificacion = this.misTutorias.filter(t => t.calificacion);
    if (tutoriasConCalificacion.length > 0) {
      const suma = tutoriasConCalificacion.reduce((acc, t) => acc + t.calificacion.calificacion, 0);
      this.profesorCalificacionPromedio = parseFloat((suma / tutoriasConCalificacion.length).toFixed(1));
    } else {
      this.profesorCalificacionPromedio = 5.0;
    }

    const estrellaCounts = [0, 0, 0, 0, 0];
    tutoriasConCalificacion.forEach(t => {
      const valor = t.calificacion.calificacion;
      if (valor >= 1 && valor <= 5) {
        estrellaCounts[5 - valor]++;
      }
    });

    this.profesorDonaData = {
      labels: ['Excelente (5★)', 'Muy Bueno (4★)', 'Bueno (3★)', 'Regular (2★)', 'Malo (1★)'],
      datasets: [{
        data: estrellaCounts,
        backgroundColor: ['#198754', '#20c997', '#ffc107', '#fd7e14', '#dc3545']
      }]
    };

    const countsMes = [0, 0, 0, 0, 0];
    this.misTutorias.filter(t => t.estado === 'finalizada' || t.estado === 'completada').forEach(t => {
      const m = new Date(t.fecha_hora).getMonth();
      if (m >= 2 && m <= 6) {
        countsMes[m - 2]++;
      }
    });

    this.profesorBarrasData = {
      labels: ['Marzo', 'Abril', 'Mayo', 'Junio', 'Julio'],
      datasets: [{ data: countsMes, label: 'Horas Dictadas', backgroundColor: '#0d6efd', borderRadius: 4 }]
    };
  }

  actualizarEstadoTutoria(nuevoEstado: 'pendiente' | 'aceptada' | 'rechazada' | 'finalizada') {
    if (!this.tutoriaSeleccionada) return;

    const body = {
      alumno_id: this.tutoriaSeleccionada.alumno_id,
      profesor_id: this.tutoriaSeleccionada.profesor_id,
      categoria_id: this.tutoriaSeleccionada.categoria_id,
      fecha_hora: this.tutoriaSeleccionada.fecha_hora,
      estado: nuevoEstado,
      mensaje: this.tutoriaSeleccionada.mensaje,
      modalidad: this.tutoriaSeleccionada.modalidad,
      precio_acordado: this.tutoriaSeleccionada.precio_acordado
    };

    this.tutoriaService.responderTutoria(this.tutoriaSeleccionada.id, body).subscribe({
      next: (res: any) => {
        if (res && res.status === 1) {
          Swal.fire({
            icon: 'success',
            title: 'Tutoría Actualizada',
            text: `La tutoría se actualizó a "${nuevoEstado}" correctamente.`,
            timer: 2000,
            showConfirmButton: false
          });
          this.cerrarModalTutoria();
          this.cargarTutorias();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: res.msg || 'No se pudo actualizar la tutoría.'
          });
        }
      },
      error: (err) => {
        console.error('Error al actualizar tutoría:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error de Red',
          text: 'No se pudo conectar con el servidor.'
        });
      }
    });
  }

  verDetalleTutoria(tutoria: any): void {
    this.tutoriaSeleccionada = tutoria;
    this.cdr.detectChanges();
  }

  cerrarModalTutoria(): void {
    this.tutoriaSeleccionada = null;
    this.nuevaPuntuacion = 0;
    this.nuevoComentario = '';
    this.cdr.detectChanges();
  }

  verDetalleTarea(tarea: any): void {
    this.tareaSeleccionada = tarea;
    this.cdr.detectChanges();
  }

  cerrarModalTarea(): void {
    this.tareaSeleccionada = null;
    this.cdr.detectChanges();
  }

  getStars(rating: number): string {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }

  seleccionarPuntuacion(star: number) {
    this.nuevaPuntuacion = star;
  }

  enviarCalificacionDesdeModal() {
    if (!this.tutoriaSeleccionada || this.nuevaPuntuacion === 0) return;

    const body = {
      tutoria_id: this.tutoriaSeleccionada.id,
      calificacion: this.nuevaPuntuacion,
      comentario: this.nuevoComentario
    };

    this.calificacionService.crearCalificacion(body).subscribe({
      next: (res: any) => {
        if (res && res.status === 1) {
          Swal.fire({
            icon: 'success',
            title: '¡Muchas Gracias!',
            text: 'Tu calificación ha sido enviada con éxito.',
            timer: 2000,
            showConfirmButton: false
          });
          this.cerrarModalTutoria();
          this.cargarTutorias();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: res.msg || 'No se pudo registrar la calificación.'
          });
        }
      },
      error: (err) => {
        console.error('Error al calificar:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al procesar la calificación.'
        });
      }
    });
  }
}
