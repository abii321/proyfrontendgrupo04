import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AutenticacionService } from '../../services/autenticacion.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit {
  usuarioId: string | number = '';
  email: string = '';
  rol: string = '';
  nombre: string = '';
  apellido: string = '';
  ubicacion: string = '';
  universidad: string = '';
  carrera: string = '';

  msgSuccess: string = '';
  msgError: string = '';

  constructor(public authService: AutenticacionService, private router: Router) { }

  ngOnInit(): void {
    if (!this.authService.userLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    const userStr = sessionStorage.getItem('usuario');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.usuarioId = user.id || user.email; // usamos id de usuario si existe, o el email
      this.email = user.email;
      this.rol = user.rol;
      this.nombre = user.nombre;
      this.apellido = user.apellido;
      this.ubicacion = user.ubicacion;
      this.universidad = user.universidad;
      this.carrera = user.carrera;
    }
  }

  guardarCambios(): void {
    this.msgSuccess = '';
    this.msgError = '';

    const body = {
      nombre: this.nombre,
      apellido: this.apellido,
      ubicacion: this.ubicacion,
      universidad: this.universidad,
      carrera: this.carrera
    };

    const userStr = sessionStorage.getItem('usuario');
    if (userStr) {
      const currentUser = JSON.parse(userStr);
      // Para encontrar la ID de Sequelize adecuada
      const id = currentUser.id;
      if (!id) {
        this.msgError = 'ID de usuario no encontrado en la sesión.';
        return;
      }

      this.authService.updateUsuario(id, body).subscribe({
        next: (result: any) => {
          if (result.status === '1') {
            this.msgSuccess = 'Perfil actualizado con éxito.';
            // Actualizar sessionStorage con los nuevos datos combinados
            const updatedUser = { ...currentUser, ...body };
            sessionStorage.setItem('usuario', JSON.stringify(updatedUser));
          } else {
            this.msgError = result.msg || 'Error al actualizar el perfil.';
          }
        },
        error: (err) => {
          console.error(err);
          this.msgError = 'No se pudo conectar con el servidor para actualizar el perfil.';
        }
      });
    }
  }
}
