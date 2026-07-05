import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HorarioDisponible } from './../models/horario-disponible.class';

@Injectable({
  providedIn: 'root',
})
export class HorarioDisponibleService {
  urlHost : string = "http://localhost:3000/";
  urlBase : string = this.urlHost + 'api/horarioDisponible/';

  constructor(private http: HttpClient){ }

  agregarHorario( horario: HorarioDisponible, profesorId: number){
    let httpOptions = {
      headers : new HttpHeaders({
        'Content-Type':'application/json'
      })
    };
    let body = {
      'diaSemana' : horario.diaSemana,
      'horaInicio' : horario.horaInicio,
      'horaFin' : horario.horaFin,  
      'modalidad' : horario.modalidad,
      'profesorId' : profesorId,
    }
    //console.log(body);
    return this.http.post(this.urlBase, body, httpOptions);
  }

  eliminarHorario( idHorario: number){
    console.log(idHorario);
    return this.http.delete(this.urlBase + idHorario);
  }

  obtenerHorarios( profesorId: number){
    let httpOptions = {
      headers : new HttpHeaders({
        'Content-Type':'application/json'
      })
    }
    return this.http.get(this.urlBase + "profesor/" + profesorId, httpOptions);
  }

}
