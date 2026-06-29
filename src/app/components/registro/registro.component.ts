import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutenticacionService } from '../../services/autenticacion.service';
import { Usuario } from '../../models/usuario.class';

declare const google: any;

@Component({
  selector: 'app-registro',
  imports: [CommonModule, FormsModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css',
})

export class RegistroComponent implements AfterViewInit {
  usuario: Usuario;
  banGoogle: boolean = false;
  googleToken: string = '';

  constructor( private autenticacionService: AutenticacionService, private cdr: ChangeDetectorRef ) {
    this.usuario = new Usuario();
    this.usuario.rol = ''; 
  }

  ngAfterViewInit(): void {
    this.inicializarBotonGoogle();
  }

  inicializarBotonGoogle() {
    if (typeof google !== 'undefined') {
      // Inicializa el SDK de Google con el Client ID
      google.accounts.id.initialize({
        client_id: '514983060587-l7mo7rrdidk3p0l1skhemau7lmddajvi.apps.googleusercontent.com',
        callback: this.handleGoogleResponse.bind(this) // La función que va a recibir el token
      });

      // botón de google
      google.accounts.id.renderButton(
        document.getElementById('googleBtnContainer'),
        { theme: 'outline', size: 'large', text: 'signup_with' }
      );
    }
  }

  handleGoogleResponse(response: any) {
    console.log("¡Google respondió con éxito!");
    this.googleToken = response.credential; 
    this.banGoogle = true;
    this.cdr.detectChanges(); 
  }

  cancelarGoogle() {
    this.banGoogle = false;
    this.googleToken = '';
    setTimeout(() => this.inicializarBotonGoogle(), 50);
  }
  
  // Registro definitivo enviando el token al backend
  registrarUsuarioGoogle() {
    const body = {
      token: this.googleToken, 
      rol: this.usuario.rol,
      ubicacion: this.usuario.ubicacion,
      universidad: this.usuario.universidad,
      carrera: this.usuario.carrera
    };
    //console.log(body);

    this.autenticacionService.postSignUpGoogle(body).subscribe(
      (result: any) => {
        console.log(result);
      },
      (error : any) => {
        console.error("Error al registrar con Google:", error);
      }
    );
  }

  registrarUsuarioLocal(){
    this.autenticacionService.postSignUpLocal(this.usuario).subscribe(
      ( result : any) => {
        console.log(result);
        this.cdr.detectChanges();
      },
      ( error : any ) => {
        console.log(error);
      }
    )
  }
}