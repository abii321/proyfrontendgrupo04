import { Component, OnInit } from '@angular/core';

import { Solicitud } from '../../../models/solicitud.class';
import { SolicitudService } from '../../../services/solicitud-ayuda.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-solicitud-ayuda',
  templateUrl: './solicitud-ayuda.component.html',
  styleUrls: ['./solicitud-ayuda.component.css'],
  imports: [CommonModule, FormsModule],
  standalone: true
})

export class SolicitudAyudaComponent implements OnInit{

  solicitudes:Solicitud[]=[];

  solicitud:Solicitud=new Solicitud();

  constructor(
    private solicitudService:SolicitudService
  ){}

  ngOnInit(){

    this.cargarSolicitudes();

  }

  cargarSolicitudes(){

    this.solicitudService.getSolicitudes().subscribe({

      next:(result)=>{

        this.solicitudes=result.data;

      },

      error:(err)=>{

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

  eliminar(id:number){

    this.solicitudService.deleteSolicitud(id).subscribe({

      next:()=>{

        this.cargarSolicitudes();

      }

    });

  }

}