import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TutoriaService {
  // Ajustá el puerto y la ruta según tu backend
  private apiUrl = 'http://localhost:3000/api/tutorias'; 

  constructor(private http: HttpClient) { }

  //  Para que el Alumno pida la tutoría
  solicitarTutoria(datosTutoria: any): Observable<any> {
    return this.http.post(this.apiUrl, datosTutoria);
  }

  //  Para que el Profesor vea las solicitudes
  obtenerTutorias(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  //  Para que el Profesor acepte y dispare el Calendar
  responderTutoria(id: number, estadoActualizado: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, estadoActualizado);
  }
}