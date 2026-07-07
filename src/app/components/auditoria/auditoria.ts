import { Component, OnInit } from '@angular/core';
import { AuditoriaService } from '../../services/auditoria.service';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-auditoria',
  imports: [ DatePipe],
  templateUrl: './auditoria.html',
  styleUrl: './auditoria.css',

})
export class AuditoriaComponent implements OnInit{

  auditorias:any[]=[];

  constructor(private auditoriaService:AuditoriaService){}

  ngOnInit(){

    this.cargar();

  }

  cargar(){

    this.auditoriaService.obtenerAuditorias().subscribe({

      next:(res:any)=>{

        this.auditorias=res.data;

      }

    });

  }

}
