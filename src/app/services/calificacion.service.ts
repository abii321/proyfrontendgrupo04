import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CalificacionService {
  private urlHost = 'http://localhost:3000/';
  private apiUrl = this.urlHost + 'api/calificacion';

  constructor(private http: HttpClient) { }

  crearCalificacion(data: { tutoria_id: number, calificacion: number, comentario?: string }): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  obtenerCalificacionPorTutoria(tutoriaId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/tutoria/${tutoriaId}`);
  }
}
