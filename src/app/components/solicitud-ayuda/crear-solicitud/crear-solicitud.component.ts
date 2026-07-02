import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Solicitud } from '../../../models/solicitud.class';
import { SolicitudService } from '../../../services/solicitud-ayuda.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-crear-solicitud',
  templateUrl: './crear-solicitud.component.html',
  styleUrls: ['./crear-solicitud.component.css'],
  imports: [CommonModule, FormsModule],
  standalone: true
})
export class CrearSolicitudComponent implements OnInit {

  solicitud: Solicitud = new Solicitud();
  categorias: any[] = [];
  usuario: any = JSON.parse(sessionStorage.getItem('usuario') || '{}');

  archivoBase64: string = '';
  archivoSafeUrl: SafeUrl = '';
  archivoNombre: string = '';

  private solicitudService = inject(SolicitudService);
  private router = inject(Router);

  constructor(private cdr: ChangeDetectorRef, private domSanitizer: DomSanitizer) { }
  ngOnInit() {
    this.solicitud.id_usuario = this.usuario.id || 0;
    this.cargarCategorias();
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

  onArchivoSeleccionado(event: any) {
    const archivo = event.target.files[0];
    if (!archivo) return;

    const tiposPermitidos = ['application/pdf', 'image/png', 'image/jpeg',
      'application/msword',  // .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'text/plain'  // .txt
    ];
    if (!tiposPermitidos.includes(archivo.type)) {
      alert('Solo se permiten archivos PDF, PNG, JPG, DOC, DOCX o TXT');
      return;
    }

    this.archivoNombre = archivo.name;

    const reader = new FileReader();
    reader.onload = () => {
      this.archivoBase64 = reader.result as string;
      this.archivoSafeUrl = this.domSanitizer.bypassSecurityTrustUrl(this.archivoBase64);
      this.solicitud.archivoAdjunto = this.archivoBase64;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(archivo);
  }

  guardar() {
    //if (!this.solicitud.titulo || !this.solicitud.descripcion || !this.solicitud.id_categoria)
    if (!this.solicitud.titulo || !this.solicitud.descripcion) {
      alert('Por favor completá los campos obligatorios');
      return;
    }

    this.solicitudService.createSolicitud(this.solicitud).subscribe({
      next: (result) => {
        alert(result.msg);
        this.router.navigate(['/solicitud-ayuda']);
      },
      error: (err) => console.error('Error al crear solicitud', err)
    });
  }

  cancelar() {
    this.router.navigate(['/solicitud-ayuda']);
  }

}