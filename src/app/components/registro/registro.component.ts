import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutenticacionService } from '../../services/autenticacion.service';
import { Usuario } from '../../models/usuario.class';

@Component({
  selector: 'app-registro',
  imports: [ CommonModule, FormsModule ],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css',
})
export class RegistroComponent {
  usuario : Usuario;
  
  constructor( private autenticacionService: AutenticacionService, private cdr: ChangeDetectorRef ){ 
    this.usuario = new Usuario();
  }

  registrarUsuario(){
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
