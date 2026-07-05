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


  private solicitudService = inject(SolicitudService);
  constructor(private cdr: ChangeDetectorRef) { }
  ngOnInit() {
    this.cargarSolicitudes();
    this.cargarCategorias();
  }

  cargarSolicitudes() {
    this.solicitudService.getSolicitudes().subscribe({
      next: (result) => {
        this.solicitudes = result.data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar solicitudes', err)
    });
  }

  esDueno(s: Solicitud): boolean {
    return s.id_usuario === this.idUsuarioLogueado;
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

  getNombreCategoria(id: number): string {
    const cat = this.categorias.find(c => c.id === id);
    return cat ? cat.nombre : 'Sin categoría';
  }
  
}