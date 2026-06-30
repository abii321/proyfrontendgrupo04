import { Component, OnInit, inject } from '@angular/core';
import { Solicitud } from '../../../models/solicitud.class';
import { Respuesta } from '../../../models/respuesta.class';
import { ActivatedRoute } from '@angular/router';
import { SolicitudService } from '../../../services/solicitud-ayuda.service';
import { RespuestaAyudaService } from '../../../services/respuesta-ayuda.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-respuesta-ayuda.component',
  imports: [CommonModule, FormsModule],
  templateUrl: './respuesta-ayuda.component.html',
  styleUrl: './respuesta-ayuda.component.css',
  standalone: true
})
export class RespuestaAyudaComponent implements OnInit {

  solicitud!: Solicitud;

  respuesta = new Respuesta();

  private route = inject(ActivatedRoute);
  private solicitudService = inject(SolicitudService);
  private respuestaService = inject(RespuestaAyudaService);

  ngOnInit() {

    const id = this.route.snapshot.params['id'];

    this.cargarSolicitud(id);

  }

  cargarSolicitud(id: number | undefined) {
    if (id === undefined) return;
    this.solicitudService.getSolicitud(id).subscribe({
      next: (result) => {
        this.solicitud = result.data;
      }
    });
  }

  guardar() {
    if (!this.respuesta.respuesta || this.solicitud.id === undefined) return;
    this.respuesta.id_solicitud = this.solicitud.id;
    this.respuestaService.createRespuesta(this.respuesta).subscribe({
      next: (result) => {
        alert('Respuesta enviada.');
        this.respuesta = new Respuesta();
        this.cargarSolicitud(this.solicitud.id);
      },
      error: (err) => console.error(err)
    });
  }
}
