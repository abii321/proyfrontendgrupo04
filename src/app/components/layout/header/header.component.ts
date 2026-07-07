import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AutenticacionService } from '../../../services/autenticacion.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  autenticacionService = inject(AutenticacionService);

  rolUsuario = sessionStorage.getItem("usuario")? JSON.parse(sessionStorage.getItem("usuario")!).rol : 'null';

}
