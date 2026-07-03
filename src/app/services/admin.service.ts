import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private apiUrl = 'http://localhost:3000/api/admin';

  constructor(private http: HttpClient) { }

  // Obtiene los contadores generales para las KPI cards
  getSummary(): Observable<any> {
    return this.http.get(`${this.apiUrl}/summary`);
  }

  // Obtiene usuarios agrupados por rol — datos para el gráfico de barras
  getUsersByRole(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users-by-role`);
  }

  // Obtiene solicitudes de ayuda agrupadas por estado — datos para el gráfico de torta
  getHelpRequestsByState(): Observable<any> {
    return this.http.get(`${this.apiUrl}/requests-by-state`);
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
