import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AutenticacionService } from '../../services/autenticacion.service';
import { TutoriaService } from '../../services/tutoria.service';
import { MercadoPagoService } from '../../services/mercadoPago.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gestion-tutoria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-tutoria.component.html',
  styleUrls: ['./gestion-tutoria.component.css']
})
export class GestionTutoriaComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AutenticacionService);
  private tutoriaService = inject(TutoriaService);
  private mpService = inject(MercadoPagoService);
  private cdr = inject(ChangeDetectorRef);
  private sanitizer = inject(DomSanitizer);

  rol: string = '';
  usuarioId: number = 0;
  alumnoProveedorAuth: string = '';
  alumnoEmail: string = '';
  calendarUrl: SafeResourceUrl | null = null;

  profesorSeleccionado: any = { 
    id: 0,
    nombre: '', 
    tarifaBase: 2000,
    categoriasEnseniadas: []
  };

  horariosProfesor: any[] = [];

  solicitud = {
    modalidad: 'virtual',
    fechaHora: '',
    mensaje: '',
    categoriaId: ''
  };

  errorDisponibilidad: string = '';
  nuevoHorario = { diaSemana: 'lunes', horaInicio: '', horaFin: '' };

  ngOnInit() {
    if (!this.authService.userLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.rol = this.authService.getUserRole();
    const userStr = sessionStorage.getItem('usuario');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.usuarioId = user.id;
      this.alumnoProveedorAuth = user.proveedorAuth || 'local';
      this.alumnoEmail = user.email || '';
    }

    if (this.rol === 'alumno') {
      const profesorId = parseInt(this.route.snapshot.queryParams['profesorId'] || '0');
      if (profesorId) {
        this.cargarProfesor(profesorId);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se especificó un profesor válido.'
        }).then(() => {
          this.router.navigate(['/solicitar-tutoria']);
        });
      }

      if (this.alumnoProveedorAuth === 'Google' && this.alumnoEmail) {
        const rawUrl = `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(this.alumnoEmail)}&ctz=America/Argentina/Buenos_Aires`;
        this.calendarUrl = this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);
      }
    } else if (this.rol === 'profesor') {
      this.cargarMisHorarios();
    }
  }

  cargarProfesor(id: number) {
    this.tutoriaService.obtenerUsuarios().subscribe({
      next: (users: any[]) => {
        const userDetail = users.find((u: any) => u.id === id);
        if (userDetail) {
          this.profesorSeleccionado = {
            id: userDetail.id,
            nombre: `${userDetail.nombre} ${userDetail.apellido}`,
            tarifaBase: userDetail.tarifaBase || 2000,
            categoriasEnseniadas: userDetail.categoriasEnseniadas || []
          };
          this.horariosProfesor = (userDetail.horarios || []).map((h: any) => ({
            id: h.id,
            diaSemana: h.dia_semana || h.diaSemana,
            horaInicio: (h.hora_inicio || h.horaInicio).slice(0, 5),
            horaFin: (h.hora_fin || h.horaFin).slice(0, 5)
          }));
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar datos del profesor:', err);
        this.cdr.detectChanges();
      }
    });
  }

  cargarMisHorarios() {
    this.tutoriaService.obtenerUsuarios().subscribe({
      next: (users: any[]) => {
        const myDetail = users.find((u: any) => u.id === this.usuarioId);
        if (myDetail && myDetail.horarios) {
          this.horariosProfesor = myDetail.horarios.map((h: any) => ({
            id: h.id,
            diaSemana: h.dia_semana || h.diaSemana,
            horaInicio: (h.hora_inicio || h.horaInicio).slice(0, 5),
            horaFin: (h.hora_fin || h.horaFin).slice(0, 5)
          }));
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar mis horarios:', err);
        this.cdr.detectChanges();
      }
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
      (h.diaSemana || '').toLowerCase() === diaElegido.toLowerCase() &&
      horaElegidaStr >= h.horaInicio &&
      horaElegidaStr <= h.horaFin
    );

    if (!horarioValido) {
      this.errorDisponibilidad = `El profesor no está disponible el ${diaElegido} a las ${horaElegidaStr}. Revisa sus horarios.`;
    } else {
      this.errorDisponibilidad = '';
    }
  }

  solicitarYPagar() {
    this.validarHorario();
    if (this.errorDisponibilidad) return;

    const data = {
      alumno_id: this.usuarioId,
      profesor_id: this.profesorSeleccionado.id,
      categoria_id: parseInt(this.solicitud.categoriaId),
      modalidad: this.solicitud.modalidad,
      precio_acordado: this.precioFinal,
      fecha_hora: new Date(this.solicitud.fechaHora).toISOString(),
      estado: 'pendiente',
      mensaje: this.solicitud.mensaje
    };

    this.tutoriaService.solicitarTutoria(data).subscribe({
      next: (res: any) => {
        const tutoriaId = res.data.id;
        
        this.mpService.crearPreferencia(tutoriaId).subscribe({
          next: (mpRes: any) => {
            Swal.fire({
              icon: 'success',
              title: 'Tutoría Solicitada',
              text: 'Redirigiéndote a Mercado Pago para realizar el pago...',
              timer: 3000,
              showConfirmButton: false
            }).then(() => {
              if (mpRes.init_point) {
                window.location.href = mpRes.init_point;
              } else {
                this.router.navigate(['/mis-solicitudes']);
              }
            });
          },
          error: (err) => {
            console.error('Error al crear preferencia de Mercado Pago:', err);
            Swal.fire({
              icon: 'warning',
              title: 'Tutoría guardada, pago pendiente',
              text: 'La tutoría se registró correctamente, pero no se pudo generar el enlace de pago.'
            }).then(() => {
              this.router.navigate(['/mis-solicitudes']);
            });
          }
        });
      },
      error: (err) => {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo registrar la solicitud de tutoría.'
        });
      }
    });
  }

  agregarHorario() {
    if (this.nuevoHorario.horaInicio && this.nuevoHorario.horaFin) {
      this.tutoriaService.agregarHorario(
        this.usuarioId, 
        this.nuevoHorario.diaSemana, 
        this.nuevoHorario.horaInicio, 
        this.nuevoHorario.horaFin
      ).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Horario Agregado',
            text: 'Tu disponibilidad se guardó correctamente.',
            timer: 2000,
            showConfirmButton: false
          });
          this.cargarMisHorarios();
          this.nuevoHorario.horaInicio = '';
          this.nuevoHorario.horaFin = '';
        },
        error: (err) => {
          console.error(err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un problema al guardar el horario.'
          });
        }
      });
    }
  }

  eliminarHorario(id: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Este bloque de disponibilidad será eliminado.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.tutoriaService.eliminarHorario(id).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Eliminado',
              text: 'El horario ha sido eliminado.',
              timer: 1500,
              showConfirmButton: false
            });
            this.cargarMisHorarios();
          },
          error: (err) => {
            console.error(err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo eliminar el horario.'
            });
          }
        });
      }
    });
  }
}