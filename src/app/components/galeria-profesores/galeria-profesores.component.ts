import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AutenticacionService } from '../../services/autenticacion.service';
import { TutoriaService } from '../../services/tutoria.service';

@Component({
  selector: 'app-galeria-profesores',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './galeria-profesores.component.html',
  styleUrl: './galeria-profesores.component.css'
})
export class GaleriaProfesoresComponent implements OnInit {
  authService = inject(AutenticacionService);
  private router = inject(Router);
  private tutoriaService = inject(TutoriaService);
  private cdr = inject(ChangeDetectorRef);

  filtroCategoria: string = '';
  profesorSeleccionado: any = null;
  categorias: any[] = [];
  profesores: any[] = [];
  alumnoNivelAcademico: string = '';

  ngOnInit(): void {
    if (!this.authService.userLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.tutoriaService.obtenerCategorias().subscribe((res: any) => {
      if (res && res.data) {
        this.categorias = res.data;
      }
      this.cdr.detectChanges();
    });

    this.tutoriaService.obtenerProfesores().subscribe((res: any) => {
      this.profesores = res || [];
      this.cdr.detectChanges();
    });

    const userStr = sessionStorage.getItem('usuario');
    if (userStr) {
      const curr = JSON.parse(userStr);
      const id = curr.id;
      if (id) {
        this.tutoriaService.obtenerUsuarios().subscribe((users: any[]) => {
          const loggedUser = users.find(u => u.id === id);
          if (loggedUser) {
            this.alumnoNivelAcademico = loggedUser.nivelAcademico || '';
          }
          this.cdr.detectChanges();
        });
      }
    }
  }

  get profesoresFiltrados(): any[] {
    if (!this.filtroCategoria) {
      return this.profesores;
    }
    return this.profesores.filter(p => 
      p.categoriasEnseniadas && p.categoriasEnseniadas.some((c: any) => c.nombre === this.filtroCategoria)
    );
  }

  abrirModal(profesor: any): void {
    this.profesorSeleccionado = profesor;
  }

  cerrarModal(): void {
    this.profesorSeleccionado = null;
  }

  esNivelCompatible(profesor: any): boolean {
    if (!this.alumnoNivelAcademico) {
      return true;
    }
    if (!profesor.perfilProfesor) {
      return false;
    }
    const levelKey = this.alumnoNivelAcademico as keyof typeof profesor.perfilProfesor;
    return !!profesor.perfilProfesor[levelKey];
  }
}
