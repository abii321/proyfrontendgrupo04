import { Component, OnInit, inject } from '@angular/core';

import { Solicitud } from '../../../models/solicitud.class';
import { SolicitudService } from '../../../services/solicitud-ayuda.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-solicitud-ayuda',
  templateUrl: './solicitud-ayuda.component.html',
  styleUrls: ['./solicitud-ayuda.component.css'],
  imports: [CommonModule, FormsModule, RouterLink],
  standalone: true
})

export class SolicitudAyudaComponent implements OnInit {

  solicitudes: Solicitud[] = [];

  solicitud: Solicitud = new Solicitud();

  private solicitudService = inject(SolicitudService);

  ngOnInit() {

    this.cargarSolicitudes();

  }

  cargarSolicitudes() {

    this.solicitudService.getSolicitudes().subscribe({

      next: (result) => {

        this.solicitudes = result.data;

      },

      error: (err) => {

        console.log(err);

      }

    });

  }
  guardar() {
    console.log('Solicitud enviada:', this.solicitud);
    this.solicitudService.createSolicitud(this.solicitud).subscribe({
      next: (result) => {
        alert(result.msg);
        this.solicitud = new Solicitud();
        this.cargarSolicitudes();
      },
      error: (err) => console.error('Error al crear solicitud', err)
    });
  }

  eliminar(id: number | undefined) {
    if (id === undefined) return;
    this.solicitudService.deleteSolicitud(id).subscribe({
      next: () => {
        this.cargarSolicitudes();
      }
    });
  }

}