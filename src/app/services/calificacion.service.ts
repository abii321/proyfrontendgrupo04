import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CalificacionService {
  private urlHost = environment.urlHost;
  private apiUrl = this.urlHost + 'api/calificacion';

  constructor(private http: HttpClient) { }

  crearCalificacion(data: { tutoriaId: number, calificacion: number, comentario?: string }): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  obtenerCalificacionPorTutoria(tutoriaId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/tutoria/${tutoriaId}`);
  }
}
