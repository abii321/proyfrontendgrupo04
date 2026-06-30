import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, AfterViewInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { AutenticacionService } from '../../services/autenticacion.service';
import { Usuario } from '../../models/usuario.class';
import { GoogleAuthService } from '../../services/google-auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-registro',
  imports: [CommonModule, FormsModule, RouterLink ],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css',
})

export class RegistroComponent implements AfterViewInit {
  usuario: Usuario;
  banGoogle: boolean = false;
  googleToken: string = '';
  msg: string = "";

  constructor( private autenticacionService: AutenticacionService, private googleAuthService: GoogleAuthService, private router: Router, private cdr: ChangeDetectorRef ) {
    this.usuario = new Usuario();
    this.usuario.rol = ''; 
  }

  ngAfterViewInit(): void {
    this.cargarBotonGoogle();
  }

  cargarBotonGoogle() {
    // función intermedia que guarda el token temporalmente
    this.googleAuthService.inicializar(this.handleGoogleResponse.bind(this));

    this.googleAuthService.renderButton("googleBtnContainer", "signup_with"); // en html
  }

  handleGoogleResponse(response: any) {
    console.log("¡Google respondió con éxito!");
    this.googleToken = response.credential; 
    this.banGoogle = true; // para mostrar el resto del formulario
    this.cdr.detectChanges(); 
  }

  cancelarGoogle() {
    this.banGoogle = false;
    this.googleToken = '';
    setTimeout(() => this.cargarBotonGoogle(), 50);
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

    this.autenticacionService.postSignUpGoogle(body).subscribe(
      (result: any) => {
        console.log(result);
        this.router.navigate(['/home']);
      },
      (error : any) => {
        console.error("Error al registrar con Google:", error);
      }
    );
  }

  registrarUsuarioLocal(form: NgForm){
    this.autenticacionService.postSignUpLocal(this.usuario).subscribe(
      ( result : any) => {
        form.reset();
        this.msg = ""
        this.cdr.detectChanges();
        //this.router.navigate(['/login']);
      },
      ( error : any ) => {
        this.msg = "Error al registrar, este email ya pertenece a un usuario"
        this.cdr.detectChanges();
      }
    )
  }
  
}