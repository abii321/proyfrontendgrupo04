import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutenticacionService } from '../../services/autenticacion.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GoogleAuthService } from '../../services/google-auth.service';

@Component({
  selector: 'app-login',
  imports: [ CommonModule, FormsModule, RouterLink ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements AfterViewInit {
  email: string = '';
  password: string = '';
  msglogin!: string;
  googleToken: string = '';
  
  constructor( private autenticacionService: AutenticacionService, private googleAuthService: GoogleAuthService,
    private cdr: ChangeDetectorRef, private router: Router,){ 
  }

  loginUsuario(){
    this.autenticacionService.postLoginLocal(this.email, this.password).subscribe(
      ( result : any) => {
        if( result.status == 1 ){
          sessionStorage.setItem("usuario", JSON.stringify(result));
          this.router.navigate(['/home']);
        }
        else this.msglogin="Credenciales incorrectas";
      },
      ( error : any ) => {
        console.log(error);
      }
    )
  }

  ngAfterViewInit(): void {
    this.cargarBotonGoogle();
  }

  cargarBotonGoogle() {
    this.googleAuthService.inicializar((response: any) => {
      this.loginUsuarioGoogle(response);
    });
    this.googleAuthService.renderButton('googleLoginBtn', 'signin_with');
  }

  loginUsuarioGoogle( response: any) {
    console.log("Google respondió", response);
    
    const body = {
      token: response.credential, 
    };

    this.autenticacionService.postLoginGoogle(body).subscribe(
      (result: any) => {
        if( result.status == 1 ){
          sessionStorage.setItem("usuario", JSON.stringify(result));
          this.router.navigate(['/home']);
        }
        else this.msglogin="Credenciales incorrectas";
      },
      (error : any) => {
        console.error("Error al registrar con Google:", error);
      }
    );
  }

}
