import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Solicitud } from '../../../models/solicitud.class';
import { SolicitudService } from '../../../services/solicitud-ayuda.service';

@Component({
  selector: 'app-solicitud-ayuda',
  templateUrl: './solicitud-ayuda.component.html',
  styleUrls: ['./solicitud-ayuda.component.css'],
  imports: [CommonModule, RouterLink,],
  standalone: true
})
export class SolicitudAyudaComponent implements OnInit {

  solicitudes: Solicitud[] = [];
  usuario: any = JSON.parse(sessionStorage.getItem('usuario') || '{}');
  rolUsuario: string = this.usuario.rol || '';
  idUsuarioLogueado: number = this.usuario.id || 0;
  categorias: any[] = [];
  usuariosPorId: { [key: number]: any } = {};


  private solicitudService = inject(SolicitudService);
  constructor(private cdr: ChangeDetectorRef) { }
  ngOnInit() {
    this.cargarSolicitudes();
    this.cargarCategorias();
    this.cargarUsuarios();
  }

  cargarSolicitudes() {
    this.solicitudService.getSolicitudes().subscribe({
      next: (result) => {
        this.solicitudes = (result.data || []).map((solicitud: any) => ({
          ...solicitud,
          fechaCreacion: solicitud.fechaCreacion || solicitud.fechaActualizacion || solicitud.createdAt || solicitud.fecha
        }));
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar solicitudes', err)
    });
  }

  esDueno(s: Solicitud): boolean {
    return s.usuarioId === this.idUsuarioLogueado;
  }

  cerrar(id: number) {
    if (!confirm('¿Cerrar esta solicitud?')) return;
    this.solicitudService.cerrarSolicitud(id).subscribe({
      next: (result) => {
        alert(result.msg);
        this.cargarSolicitudes();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cerrar', err)
    });
  }

  eliminar(id: number | undefined) {
    if (id === undefined) return;
    if (!confirm('¿Eliminar esta solicitud?')) return;
    this.solicitudService.deleteSolicitud(id).subscribe({
      next: () => {
        this.cargarSolicitudes();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al eliminar', err)
    });
  }
  cargarCategorias() {
    this.solicitudService.getCategorias().subscribe({
      next: (result) => {
        this.categorias = result.data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar categorías', err)
    });
  }

  cargarUsuarios() {
    this.solicitudService.getUsuarios().subscribe({
      next: (result) => {
        const usuarios = Array.isArray(result) ? result : result.data || [];
        this.usuariosPorId = usuarios.reduce((acc: { [key: number]: any }, usuario: any) => {
          if (usuario?.id) {
            acc[usuario.id] = usuario;
          }
          return acc;
        }, {});
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar usuarios', err)
    });
  }

  getNombreCategoria(id: number): string {
    const cat = this.categorias.find(c => c.id === id);
    return cat ? cat.nombre : 'Sin categoría';
  }

  formatearFecha(fecha: any): string {
    const fechaObj = fecha ? new Date(fecha) : null;

    if (!fechaObj || isNaN(fechaObj.getTime())) {
      return 'Sin fecha';
    }

    return fechaObj.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getNombreCreador(s: Solicitud): string {
    const usuario = this.usuariosPorId[s.usuarioId];

    if (usuario?.nombre || usuario?.apellido) {
      return `${usuario.nombre ?? ''} ${usuario.apellido ?? ''}`.trim();
    }

    const usuarioActual = this.getUsuarioLogueado();
    if (usuarioActual?.id === s.usuarioId) {
      return `${usuarioActual.nombre ?? ''} ${usuarioActual.apellido ?? ''}`.trim() || 'Tú';
    }

    return 'Usuario';
  }

  private getUsuarioLogueado(): any {
    const usuarioClave =
      localStorage.getItem('usuario') ||
      sessionStorage.getItem('usuario') ||
      localStorage.getItem('user') ||
      sessionStorage.getItem('user');

    if (!usuarioClave) {
      return null;
    }

    try {
      return JSON.parse(usuarioClave);
    } catch {
      return null;
    }
  }
  
}