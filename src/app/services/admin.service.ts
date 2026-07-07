import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  urlHost: string = environment.urlHost;
  private apiUrl = this.urlHost + 'api/admin';

  constructor(private http: HttpClient) { }

  // Obtiene los contadores generales para las KPI cards
  getSummary(): Observable<any> {
    return this.http.get(`${this.apiUrl}/summary`);
  }

  // Obtiene usuarios agrupados por rol y estado — datos para el gráfico de barras apilado
  getUsersByRole(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users-by-role`);
  }

  // Obtiene solicitudes de ayuda agrupadas por estado — datos para el gráfico de torta
  getHelpRequestsByState(): Observable<any> {
    return this.http.get(`${this.apiUrl}/requests-by-state`);
  }

  // Obtiene tutorías agrupadas por estado — datos para el gráfico de torta de tutorías
  getTutorialsByState(): Observable<any> {
    return this.http.get(`${this.apiUrl}/tutorials-by-state`);
  }

  // Obtiene tutorías agrupadas por mes — datos para el gráfico de línea
  getTutorialsByMonth(): Observable<any> {
    return this.http.get(`${this.apiUrl}/tutorials-by-month`);
  }

  // Obtiene el listado completo de tutorías para la tabla
  getFullTutorials(): Observable<any> {
    return this.http.get(`${this.apiUrl}/full-tutorials`);
  }
}
