import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';



@Injectable({
  providedIn: 'root'
})
export class AuditoriaService {
    urlHost : string = environment.urlHost;
    private url = this.urlHost + "api/auditoria";

  constructor(private http: HttpClient) {}

  obtenerAuditorias(): Observable<any> {
    return this.http.get(this.url);
  }

}