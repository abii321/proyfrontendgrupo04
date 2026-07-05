import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { URL_HOST } from './api.config';

@Injectable({
  providedIn: 'root'
})
export class MercadoPagoService {

  urlHost: string = URL_HOST;
  private apiUrl = this.urlHost + 'api/mercadopago';

  constructor(private http: HttpClient) { }

  crearPreferencia(respuestaId: number, precio?: number): Observable<any> {

    return this.http.post<any>(
      `${this.apiUrl}/crear-preferencia`,
      {
        respuesta_id: respuestaId,
        precio: precio ?? 0
      }
    );

  }

}