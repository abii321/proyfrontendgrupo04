import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AutenticacionService } from '../../../services/autenticacion.service';

@Component({
  selector: 'app-header',
  imports: [ RouterLink ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  constructor( public autenticacionService: AutenticacionService){ }
}
