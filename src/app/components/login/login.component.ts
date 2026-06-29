import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutenticacionService } from '../../services/autenticacion.service';
import { ActivatedRoute, Router } from '@angular/router';

declare const google: any;

@Component({
  selector: 'app-login',
  imports: [ CommonModule, FormsModule ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit, AfterViewInit {
  email: string = '';
  password: string = '';
  msglogin!: string;
  googleToken: string = '';
  
  constructor( private autenticacionService: AutenticacionService, 
    private cdr: ChangeDetectorRef,
    private router: Router ){ 
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


  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.inicializarBotonGoogle();
  }

  inicializarBotonGoogle() {
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: '514983060587-l7mo7rrdidk3p0l1skhemau7lmddajvi.apps.googleusercontent.com', 
        callback: this.loginUsuarioGoogle.bind(this)
      });

      google.accounts.id.renderButton(
        document.getElementById('googleLoginBtn'),
        { theme: 'outline', size: 'large', text: 'signin_with' } 
      );
    }
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
