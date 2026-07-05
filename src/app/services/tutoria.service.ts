import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { URL_HOST } from './api.config';

@Injectable({
  providedIn: 'root'
})
export class TutoriaService {
  private urlHost = URL_HOST;
  private apiUrl = this.urlHost + 'api/tutoria'; 

  constructor(private http: HttpClient) { }

  obtenerProfesores(): Observable<any> {
    return this.http.get(this.urlHost + 'api/usuario?rol=profesor');
  }

  obtenerUsuarios(): Observable<any> {
    return this.http.get(this.urlHost + 'api/usuario');
  }

  obtenerCategorias(): Observable<any> {
    return this.http.get(this.urlHost + 'api/categoria');
  }

  solicitarTutoria(datosTutoria: any): Observable<any> {
    return this.http.post(this.apiUrl, datosTutoria);
  }

  obtenerTutorias(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  responderTutoria(id: number, estadoActualizado: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, estadoActualizado);
  }

  asociarProfesorCategoria(profesorId: number, categoriaId: number): Observable<any> {
    return this.http.post(this.urlHost + 'api/categoria/profesor', { profesor_id: profesorId, categoria_id: categoriaId });
  }

  desasociarProfesorCategoria(profesorId: number, categoriaId: number): Observable<any> {
    return this.http.delete(this.urlHost + 'api/categoria/profesor', {
      body: { profesor_id: profesorId, categoria_id: categoriaId }
    });
  }

  agregarHorario(usuarioId: number, diaSemana: string, horaInicio: string, horaFin: string): Observable<any> {
    return this.http.post(this.urlHost + 'api/usuario/horario', { usuario_id: usuarioId, diaSemana, horaInicio, horaFin });
  }

  eliminarHorario(horarioId: number): Observable<any> {
    return this.http.delete(`${this.urlHost}api/usuario/horario/${horarioId}`);
  }
}
