import { Injectable } from '@angular/core';

declare const google: any;

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {

  private clientId = '514983060587-l7mo7rrdidk3p0l1skhemau7lmddajvi.apps.googleusercontent.com';

  inicializar(callback: (response: any) => void) {
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: this.clientId,
        callback: callback // Pasamos la función manejadora
      });
    }
  }

  renderButton(idElemento: string, textoBoton: 'signup_with' | 'signin_with' = 'signup_with') {
    const contenedor = document.getElementById(idElemento);
    if (contenedor && typeof google !== 'undefined') {
      google.accounts.id.renderButton(contenedor, {
        theme: 'outline',
        size: 'large',
        text: textoBoton
      });
    }
  }

}