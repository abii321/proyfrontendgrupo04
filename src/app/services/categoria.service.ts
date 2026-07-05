import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CategoriaService {

  urlHost : string = "http://localhost:3000/";
  urlBase : string = this.urlHost + 'api/categoria/';

  constructor(private http: HttpClient){ }

  obtenerCategorias( ): Observable<any>{
    let httpOptions = {
      headers : new HttpHeaders({
        'Content-Type':'application/json'
      })
    };
      
    return this.http.post(this.urlBase, httpOptions);
  }
}
