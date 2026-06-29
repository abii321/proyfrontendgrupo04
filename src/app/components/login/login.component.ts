import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutenticacionService } from '../../services/autenticacion.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ CommonModule, FormsModule ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  msglogin!: string;
  
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
}
