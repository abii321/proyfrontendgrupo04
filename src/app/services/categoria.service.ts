import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { URL_HOST } from './api.config';

@Injectable({
  providedIn: 'root',
})
export class CategoriaService {

  urlHost : string = URL_HOST;
  urlBase : string = this.urlHost + 'api/categoria/';

  constructor(private http: HttpClient){ }

  asociarProfesor( categoriaId: number, profesorId: number){
    let httpOptions = {
      headers : new HttpHeaders({
        'Content-Type':'application/json'
      })
    };
    let body = {
      'categoriaId' : categoriaId,
      'profesorId' : profesorId,
      'estado': 'activo',
    }
    console.log(body);
    return this.http.post(this.urlBase+"profesor", body, httpOptions);
  }

  desasociarProfesor( categoriaId: number, profesorId: number){
    let body = {
      'categoriaId' : categoriaId,
      'profesorId' : profesorId,
    }
    console.log(body);
    
    return this.http.delete(this.urlBase + "profesor", {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
        body: body 
    });
  }

  obtenerCategoriasdeProfesor( profesorId: number){
    return this.http.get(this.urlBase + "profesor/" + profesorId);
  }

  obtenerCategorias( ): Observable<any>{
    return this.http.get(this.urlBase);
  }
}
