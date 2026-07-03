import { Component, OnInit, inject, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AutenticacionService } from '../../services/autenticacion.service';
import { GoogleAuthService } from '../../services/google-auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit, AfterViewInit {
  private authService = inject(AutenticacionService);
  private googleAuthService = inject(GoogleAuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  nombreCompleto: string = '';
  carrera: string = '';
  universidad: string = '';
  rol: string = '';
  proveedorAuth: string = '';

  ngOnInit(): void {
    if (!this.authService.userLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    const userStr = sessionStorage.getItem('usuario');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.nombreCompleto = `${user.nombre} ${user.apellido}`;
      this.carrera = user.carrera;
      this.universidad = user.universidad;
      this.rol = user.rol;
      this.proveedorAuth = user.proveedorAuth || 'local';
    }
  }

  ngAfterViewInit(): void {
    if (this.proveedorAuth !== 'Google') {
      this.cargarBotonGoogle();
    }
  }

  cargarBotonGoogle() {
    this.googleAuthService.inicializar((response: any) => {
      this.vincularCuentaGoogle(response);
    });
    this.googleAuthService.renderButton('googleLinkBtn', 'signup_with');
  }

  vincularCuentaGoogle(response: any) {
    const userStr = sessionStorage.getItem('usuario');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.authService.postVincularGoogle(user.id, response.credential).subscribe({
        next: (result: any) => {
          if (result.status === 1) {
            alert('Cuenta vinculada a Google correctamente.');
            const updatedUser = { ...user, ...result.usuario };
            sessionStorage.setItem('usuario', JSON.stringify(updatedUser));
            this.proveedorAuth = 'Google';
            this.cdr.detectChanges();
          } else {
            alert(result.msg || 'Error al vincular con Google.');
          }
        },
        error: (err) => {
          console.error(err);
          alert('Error al conectar con el servidor.');
        }
      });
    }
  }
}
