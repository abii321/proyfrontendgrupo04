import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Respuesta } from '../models/respuesta.class';
import { URL_HOST } from './api.config';

@Injectable({
  providedIn: 'root'
})
export class RespuestaAyudaService {

  urlHost: string = URL_HOST;
  urlBase: string = this.urlHost + "api/respuesta/";

  constructor(private http: HttpClient) { }

  getRespuestas(idSolicitud: number): Observable<any> {

    return this.http.get(
      this.urlBase + "solicitud/" + idSolicitud
    );

  }

  createRespuesta(respuesta: Respuesta): Observable<any> {

    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.post(
      this.urlBase,
      respuesta,
      httpOptions
    );

  }

  editRespuesta(id: number, respuesta: Respuesta): Observable<any> {

    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.put(
      this.urlBase + id,
      respuesta,
      httpOptions
    );

  }

  deleteRespuesta(id: number): Observable<any> {

    return this.http.delete(
      this.urlBase + id
    );

  }

}