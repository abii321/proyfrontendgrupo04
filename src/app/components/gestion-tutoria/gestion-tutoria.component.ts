import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AutenticacionService } from '../../services/autenticacion.service';
import { TutoriaService } from '../../services/tutoria.service';
import { MercadoPagoService } from '../../services/mercadoPago.service';
// 1. Importar el nuevo servicio de precios
import { PrecioService } from '../../services/precio.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gestion-tutoria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-tutoria.component.html',
  styleUrls: ['./gestion-tutoria.component.css']
})
export class GestionTutoriaComponent implements OnInit {
  
  usuarioId: number = 0;
  alumnoProveedorAuth: string = '';
  alumnoEmail: string = '';
  calendarUrl: SafeResourceUrl | null = null;

  profesorSeleccionado: any = { 
    id: 0,
    nombre: '', 
    nivelAcademico: 'universitario', 
    categoriasEnseniadas: []
  };

  horariosProfesor: any[] = [];
  turnosDisponibles: any[] = []; 
  listaPreciosBD: any[] = []; // 2. Variable para guardar los precios

  solicitud = {
    modalidad: 'virtual',
    fechaSeleccionada: '', 
    fechaHora: '', 
    duracion: 60, 
    mensaje: '',
    categoriaId: ''
  };

  duracionesOpciones = [
    { label: '40 min', value: 40 },
    { label: '1 hora', value: 60 },
    { label: '1.5 horas', value: 90 },
    { label: '2 horas', value: 120 }
  ];

  errorDisponibilidad: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AutenticacionService,
    private tutoriaService: TutoriaService,
    private mpService: MercadoPagoService,
    private precioService: PrecioService, // 3. Inyectar el servicio en el constructor
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    if (!this.authService.userLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    const userStr = sessionStorage.getItem('usuario');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.usuarioId = user.id;
      this.alumnoProveedorAuth = user.proveedorAuth || 'local';
      this.alumnoEmail = user.email || '';
    }

    // 4. Traer los precios apenas entra a la pantalla
    this.cargarPrecios();

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
  }

  cargarPrecios() {
    // 5. Petición al backend usando el servicio nuevo
    this.precioService.obtenerPrecios().subscribe({
      next: (res: any) => {
        this.listaPreciosBD = res.data || res;
      },
      error: (err: any) => console.error('Error al cargar precios:', err)
    });
  }

  cargarProfesor(id: number) {
    this.tutoriaService.obtenerUsuarios().subscribe({
      next: (users: any[]) => {
        const userDetail = users.find((u: any) => u.id === id);
        if (userDetail) {
          this.profesorSeleccionado = {
            id: userDetail.id,
            nombre: `${userDetail.nombre} ${userDetail.apellido}`,
            nivelAcademico: userDetail.nivelAcademico || 'universitario',
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
      error: (err: any) => {
        console.error('Error al cargar datos del profesor:', err);
      }
    });
  }

  get precioFinal(): number {
    // 6. Si aún no cargaron los precios, retorna 0
    if (!this.solicitud.duracion || this.listaPreciosBD.length === 0) return 0;
    
    const nivel = (this.profesorSeleccionado.nivelAcademico || 'universitario').toLowerCase();
    const modalidad = this.solicitud.modalidad; 

    // 7. Busca en la base de datos el precio que coincide con nivel y modalidad
    const precioEncontrado = this.listaPreciosBD.find(
      p => p.nivel === nivel && p.modalidad === modalidad
    );

    // Si no encuentra coincidencia, usa un precio base genérico
    const tarifaHora = precioEncontrado ? precioEncontrado.precio : 10000;

    const costoCalculado = (tarifaHora / 60) * this.solicitud.duracion;
    return Math.round(costoCalculado);
  }

  setDuracion(minutos: number) {
    this.solicitud.duracion = minutos;
    this.solicitud.fechaHora = ''; 
    this.generarTurnos();
  }

  setModalidad(tipo: string) {
    this.solicitud.modalidad = tipo;
    this.solicitud.fechaHora = ''; 
    this.generarTurnos(); 
  }

  generarTurnos() {
    this.turnosDisponibles = [];
    this.solicitud.fechaHora = ''; 
    
    if (!this.solicitud.fechaSeleccionada || !this.solicitud.duracion) return;

    const dateElegida = new Date(this.solicitud.fechaSeleccionada + 'T00:00:00');
    const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const diaString = diasSemana[dateElegida.getDay()];

    const horariosDelDia = this.horariosProfesor.filter(h => 
      (h.diaSemana || '').toLowerCase() === diaString
    );

    if (horariosDelDia.length === 0) {
      this.errorDisponibilidad = 'El profesor no dicta clases en este día de la semana.';
      return;
    } else {
      this.errorDisponibilidad = '';
    }

    const tiempoBuffer = this.solicitud.modalidad === 'presencial' ? 20 : 10;

    horariosDelDia.forEach(bloque => {
      let minutosActual = this.timeToMinutes(bloque.horaInicio);
      const minutosFin = this.timeToMinutes(bloque.horaFin);

      while (minutosActual + this.solicitud.duracion <= minutosFin) {
        
        const horaInicioStr = this.minutesToTime(minutosActual);
        const horaFinStr = this.minutesToTime(minutosActual + this.solicitud.duracion);
        const fechaHoraISO = new Date(`${this.solicitud.fechaSeleccionada}T${horaInicioStr}:00`).toISOString();

        this.turnosDisponibles.push({
          inicio: horaInicioStr,
          fin: horaFinStr,
          fechaHora: fechaHoraISO
        });

        minutosActual = minutosActual + this.solicitud.duracion + tiempoBuffer;
      }
    });

    if (this.turnosDisponibles.length === 0) {
      this.errorDisponibilidad = `El profesor trabaja este día, pero no tiene un hueco de ${this.solicitud.duracion} min disponible.`;
    }
  }

  timeToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  minutesToTime(minutes: number): string {
    const h = Math.floor(minutes / 60).toString().padStart(2, '0');
    const m = (minutes % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  solicitarYPagar() {
    if (!this.solicitud.fechaHora) {
      Swal.fire('Atención', 'Debes seleccionar un horario de la lista.', 'warning');
      return;
    }

    const data = {
      alumno_id: this.usuarioId,
      profesor_id: this.profesorSeleccionado.id,
      categoria_id: parseInt(this.solicitud.categoriaId),
      modalidad: this.solicitud.modalidad,
      precio_acordado: this.precioFinal,
      fecha_hora: this.solicitud.fechaHora,
      estado: 'pendiente',
      mensaje: this.solicitud.mensaje
    };

    this.tutoriaService.solicitarTutoria(data).subscribe({
      next: (res: any) => {
        // Adaptación por si el backend manda el id suelto o adentro de data
        const tutoriaId = res.data?.id || res.id;
        
        this.mpService.crearPreferencia(tutoriaId).subscribe({
          next: (mpRes: any) => {
            Swal.fire({
              icon: 'success',
              title: 'Tutoría Solicitada',
              text: 'Redirigiéndote a Mercado Pago...',
              timer: 3000,
              showConfirmButton: false
            }).then(() => {
              if (mpRes.init_point) window.location.href = mpRes.init_point;
              else this.router.navigate(['/mis-solicitudes']);
            });
          },
          error: (err: any) => {
            console.error('Error MP:', err);
            this.router.navigate(['/mis-solicitudes']);
          }
        });
      },
      error: (err: any) => {
        Swal.fire('Error', 'No se pudo registrar la solicitud.', 'error');
      }
    });
  }
}