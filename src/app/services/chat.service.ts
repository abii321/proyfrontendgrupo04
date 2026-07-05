import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { URL_HOST } from './api.config';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  urlHost: string = URL_HOST;
  private apiUrl = this.urlHost + 'api/chat';

  constructor(private http: HttpClient) { }

  sendMessage(pregunta: string): Observable<any> {
    return this.http.post(this.apiUrl, { message: pregunta });
  }
}
