import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario.class';

@Injectable({
  providedIn: 'root',
})
export class AutenticacionService {
  urlHost : string = "http://localhost:3000/";
  urlBase : string = this.urlHost + 'api/autenticacion/';

  constructor(private http: HttpClient){ }

  postRegistroLocal( usuario: Usuario ): Observable<any>{
    let httpOptions = {
      headers : new HttpHeaders({
        'Content-Type':'application/json'
      })
    };
      
    return this.http.post(this.urlBase+"signUp", usuario, httpOptions);
  }

  postLoginLocal( email:string, password:string ): Observable<any>{
    let httpOptions = {
      headers : new HttpHeaders({
        'Content-Type':'application/json'
      })
    };
    let body = {
      'email' : email,
      'password' : password,
    }

    return this.http.post(this.urlBase+"login", body, httpOptions);
  }

  public userLoggedIn(){
    var usuario = sessionStorage.getItem("usuario");
    if(!usuario) return false;
    return true;
  }

  public logout(){
    sessionStorage.clear();
  }

  userLogged(){
    const usuario = sessionStorage.getItem("usuario");
    if(usuario) return JSON.parse(usuario).nombre;
  }

  postSignUpGoogle(datosGoogle: any): Observable<any> {
    let httpOptions = {
      headers : new HttpHeaders({
        'Content-Type':'application/json'
      })
    };
    return this.http.post(this.urlBase + "signUpGoogle", datosGoogle, httpOptions);
  }

  postLoginGoogle(datosGoogle: any): Observable<any> {
    let httpOptions = {
      headers : new HttpHeaders({
        'Content-Type':'application/json'
      })
    };
    return this.http.post(this.urlBase + "loginGoogle", datosGoogle, httpOptions);
  }

  updateUsuario(id: string | number, datos: any): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.put(this.urlHost + 'api/usuario/' + id, datos, httpOptions);
  }

}
//89