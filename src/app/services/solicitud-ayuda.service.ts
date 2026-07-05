import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Solicitud } from '../models/solicitud.class';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SolicitudService {

  urlHost: string = environment.urlHost;
  urlBase: string = this.urlHost + "api/solicitud/";

  constructor(private http: HttpClient) { }

  getSolicitudes(): Observable<any> {

    return this.http.get(this.urlBase);

  }

  getSolicitud(id: number): Observable<any> {

    return this.http.get(this.urlBase + id);

  }

  createSolicitud(solicitud: Solicitud): Observable<any> {

    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.post(this.urlBase, solicitud, httpOptions
    );

  }

  editSolicitud(id: number, solicitud: Solicitud): Observable<any> {

    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.put(
      this.urlBase + id,
      solicitud,
      httpOptions
    );

  }

  cerrarSolicitud(id: number): Observable<any> {

    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.put(
      this.urlBase + id + "/cerrar",
      {},
      httpOptions
    );

  }

  deleteSolicitud(id: number): Observable<any> {

    return this.http.delete(
      this.urlBase + id
    );

  }

  getCategorias(): Observable<any> {
    return this.http.get(this.urlHost + 'api/categoria');
  }
}