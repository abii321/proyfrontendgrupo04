import { Component, OnInit } from '@angular/core';
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
export class RespuestaAyudaComponent implements OnInit{

solicitud!:Solicitud;

respuesta=new Respuesta();

constructor(

private route:ActivatedRoute,

private solicitudService:SolicitudService,

private respuestaService:RespuestaAyudaService

){}

ngOnInit(){

const id=this.route.snapshot.params['id'];

this.cargarSolicitud(id);

}

cargarSolicitud(id:number){

this.solicitudService.getSolicitud(id).subscribe({

next:(result)=>{

this.solicitud=result.data;

}

});

}



}
