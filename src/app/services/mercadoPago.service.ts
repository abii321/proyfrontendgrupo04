import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MercadoPagoService {

  private apiUrl = 'http://localhost:3000/api/mercadopago';

  constructor(private http: HttpClient) { }

  crearPreferencia(idTutoria: number): Observable<any> {

    return this.http.post<any>(
      `${this.apiUrl}/crear-preferencia`,
      {
        tutoria_id: idTutoria
      }
    );

  }

}