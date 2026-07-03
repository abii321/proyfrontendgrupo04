import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TutoriaService {
  obtenerProfesores() {
    throw new Error('Method not implemented.');
  }
  obtenerCategorias() {
    throw new Error('Method not implemented.');
  }
  // Ajustá el puerto y la ruta según tu backend
  private apiUrl = 'http://localhost:3000/api/tutoria'; 

  constructor(private http: HttpClient) { }

  obtenerProfesores() { throw new Error('Method not implemented.'); }
  obtenerCategorias() { throw new Error('Method not implemented.'); }

  // --- MÉTODOS DE TUTORÍAS ---
  solicitarTutoria(datosTutoria: any): Observable<any> {
    return this.http.post(this.apiUrlTutorias, datosTutoria);
  }

  obtenerTutorias(): Observable<any> {
    return this.http.get(this.apiUrlTutorias);
  }

  responderTutoria(id: number, estadoActualizado: any): Observable<any> {
    return this.http.put(`${this.apiUrlTutorias}/${id}`, estadoActualizado);
  }

  // --- MÉTODOS DE HORARIOS ---
  obtenerHorariosProfesor(profesorId: number): Observable<any> {
    return this.http.get(`${this.apiUrlHorarios}/profesor/${profesorId}`);
  }

  crearHorario(datosHorario: any): Observable<any> {
    return this.http.post(this.apiUrlHorarios, datosHorario);
  }

  eliminarHorario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrlHorarios}/${id}`);
  }
}