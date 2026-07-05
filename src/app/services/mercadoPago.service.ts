import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MercadoPagoService {

  urlHost: string = environment.urlHost;
  private apiUrl = this.urlHost + 'api/mercadopago';

  constructor(private http: HttpClient) { }

  crearPreferencia(respuestaId: number, precio?: number): Observable<any> {

    return this.http.post<any>(
      `${this.apiUrl}/crear-preferencia`,
      {
        respuestaId: respuestaId,
        precio: precio ?? 0
      }
    );

  }

}