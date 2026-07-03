import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AutenticacionService } from '../../services/autenticacion.service';
import { TutoriaService } from '../../services/tutoria.service';
import { forkJoin, of } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  nombre: string = '';
  apellido: string = '';
  email: string = '';
  ubicacion: string = '';
  universidad: string = '';
  carrera: string = '';
  rol: string = '';
  biografia: string = '';
  tarifaBase: number = 0;
  nivelAcademico: string = '';

  perfilProfesor = {
    primario: false,
    secundario: false,
    universitario: false,
    doctorado: false
  };

  todasCategorias: any[] = [];
  categoriasSeleccionadas: { [key: number]: boolean } = {};
  categoriasIniciales: number[] = [];

  msgSuccess: string = '';
  msgError: string = '';

  private authService = inject(AutenticacionService);
  private tutoriaService = inject(TutoriaService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    const userStr = sessionStorage.getItem('usuario');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.rol = user.rol;
      const id = user.id;

      if (id) {
        this.tutoriaService.obtenerUsuarios().subscribe({
          next: (users: any[]) => {
            const userDetail = users.find((u: any) => u.id === id);
            if (userDetail) {
              this.nombre = userDetail.nombre;
              this.apellido = userDetail.apellido;
              this.email = userDetail.email;
              this.ubicacion = userDetail.ubicacion || '';
              this.universidad = userDetail.universidad || '';
              this.carrera = userDetail.carrera || '';
              this.biografia = userDetail.biografia || '';
              this.tarifaBase = userDetail.tarifaBase || 0;
              this.nivelAcademico = userDetail.nivelAcademico || '';

              if (userDetail.perfilProfesor) {
                this.perfilProfesor = {
                  primario: !!userDetail.perfilProfesor.primario,
                  secundario: !!userDetail.perfilProfesor.secundario,
                  universitario: !!userDetail.perfilProfesor.universitario,
                  doctorado: !!userDetail.perfilProfesor.doctorado
                };
              }

              if (userDetail.categoriasEnseniadas) {
                this.categoriasIniciales = userDetail.categoriasEnseniadas.map((c: any) => c.id);
                userDetail.categoriasEnseniadas.forEach((c: any) => {
                  this.categoriasSeleccionadas[c.id] = true;
                });
              }
            }
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Error al cargar detalles de usuario:', err);
            this.cdr.detectChanges();
          }
        });
      }
    }

    if (this.rol === 'profesor') {
      this.tutoriaService.obtenerCategorias().subscribe({
        next: (res: any) => {
          if (res && res.data) {
            this.todasCategorias = res.data;
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al obtener categorías:', err);
          this.cdr.detectChanges();
        }
      });
    }
  }

  guardarCambios(): void {
    this.msgSuccess = '';
    this.msgError = '';

    const body: any = {
      nombre: this.nombre,
      apellido: this.apellido,
      ubicacion: this.ubicacion,
      universidad: this.universidad,
      carrera: this.carrera
    };

    if (this.rol === 'profesor') {
      body.biografia = this.biografia;
      body.perfilProfesor = this.perfilProfesor;
      body.tarifaBase = this.tarifaBase;
    } else if (this.rol === 'alumno') {
      body.nivelAcademico = this.nivelAcademico;
    }

    const userStr = sessionStorage.getItem('usuario');
    if (userStr) {
      const currentUser = JSON.parse(userStr);
      const id = currentUser.id;
      if (!id) {
        this.msgError = 'ID de usuario no encontrado en la sesión.';
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: this.msgError
        });
        return;
      }

      this.authService.updateUsuario(id, body).subscribe({
        next: (result: any) => {
          if (result.status === '1') {
            if (this.rol === 'profesor') {
              const categoryActions = this.todasCategorias.map(cat => {
                const wasSelected = this.categoriasIniciales.includes(cat.id);
                const isSelected = !!this.categoriasSeleccionadas[cat.id];

                if (!wasSelected && isSelected) {
                  return this.tutoriaService.asociarProfesorCategoria(id, cat.id);
                } else if (wasSelected && !isSelected) {
                  return this.tutoriaService.desasociarProfesorCategoria(id, cat.id);
                }
                return of(null);
              });

              forkJoin(categoryActions).subscribe({
                next: () => {
                  this.msgSuccess = 'Perfil y categorías actualizados con éxito.';
                  Swal.fire({
                    icon: 'success',
                    title: 'Perfil Guardado',
                    text: this.msgSuccess,
                    timer: 2000,
                    showConfirmButton: false
                  });
                  const updatedUser = { ...currentUser, ...body };
                  sessionStorage.setItem('usuario', JSON.stringify(updatedUser));
                  this.ngOnInit();
                  this.cdr.detectChanges();
                },
                error: (err) => {
                  console.error(err);
                  this.msgError = 'Perfil guardado, pero ocurrió un error al actualizar algunas categorías.';
                  Swal.fire({
                    icon: 'warning',
                    title: 'Perfil Guardado Parcialmente',
                    text: this.msgError
                  });
                  this.cdr.detectChanges();
                }
              });
            } else {
              this.msgSuccess = 'Perfil actualizado con éxito.';
              Swal.fire({
                icon: 'success',
                title: 'Perfil Guardado',
                text: this.msgSuccess,
                timer: 2000,
                showConfirmButton: false
              });
              const updatedUser = { ...currentUser, ...body };
              sessionStorage.setItem('usuario', JSON.stringify(updatedUser));
              this.cdr.detectChanges();
            }
          } else {
            this.msgError = result.msg || 'Error al actualizar el perfil.';
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: this.msgError
            });
            this.cdr.detectChanges();
          }
        },
        error: (err) => {
          console.error(err);
          this.msgError = 'No se pudo conectar con el servidor para actualizar el perfil.';
          Swal.fire({
            icon: 'error',
            title: 'Error de Red',
            text: this.msgError
          });
          this.cdr.detectChanges();
        }
      });
    }
  }
}
