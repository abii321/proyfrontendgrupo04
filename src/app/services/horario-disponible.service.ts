import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HorarioDisponible } from './../models/horario-disponible.class';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class HorarioDisponibleService {
  urlHost : string = environment.urlHost;
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
      'estado': 'activo'
    }
    //console.log(body);
    return this.http.post(this.urlBase, body, httpOptions);
  }

  eliminarHorario( idHorario: number){
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
