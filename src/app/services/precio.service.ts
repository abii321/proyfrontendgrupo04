import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PrecioService {
  urlHost : string = "http://localhost:3000/";
  urlBase : string = this.urlHost + 'api/precio/';

  constructor(private http: HttpClient){ }

  obtenerPrecios( ): Observable<any>{
    let httpOptions = {
      headers : new HttpHeaders({
        'Content-Type':'application/json'
      })
    };
      
    return this.http.get(this.urlBase, httpOptions);
  }
}
