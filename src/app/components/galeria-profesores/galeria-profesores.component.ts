import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TutoriaService } from '../../services/tutoria.service';
import { AutenticacionService } from '../../services/autenticacion.service';
// 1. Importar el nuevo servicio
import { CategoriaService } from '../../services/categoria.service'; 

@Component({
  selector: 'app-galeria-profesores',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './galeria-profesores.component.html',
  styleUrls: ['./galeria-profesores.component.css']
})
export class GaleriaProfesoresComponent implements OnInit {
  private tutoriaService = inject(TutoriaService);
  private autenticacionService = inject(AutenticacionService);
  // 2. Inyectar el servicio de categorías
  private categoriaService = inject(CategoriaService); 

  rol: string = '';
  categorias: any[] = [];
  profesores: any[] = [];
  filtroCategoria: string = '';
  profesorSeleccionado: any = null;
  alumnoNivelAcademico: string = 'universitario';

  ngOnInit() {
    const userStr = sessionStorage.getItem('usuario');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.rol = user.rol || '';
      this.alumnoNivelAcademico = user.nivelAcademico || 'universitario';
    }

    this.cargarCategorias();
    this.cargarProfesores();
  }

  cargarCategorias() {
    // 3. Usar el nuevo servicio en vez del viejo tutoriaService
    this.categoriaService.obtenerCategorias().subscribe({
      next: (res: any) => {
        // Depende de cómo envíe el backend (res o res.data)
        this.categorias = res.data || res; 
      },
      error: (err: any) => console.error('Error al cargar categorías:', err)
    });
  }

  cargarProfesores() {
    this.tutoriaService.obtenerUsuarios().subscribe({
      next: (res: any[]) => {
        this.profesores = res.filter(u => (u.rol || '').toLowerCase() === 'profesor');
      },
      error: (err: any) => console.error('Error al cargar profesores:', err)
    });
  }

  get profesoresFiltrados() {
    if (!this.filtroCategoria) return this.profesores;
    return this.profesores.filter(p => 
      (p.categoriasEnseniadas || []).some((c: any) => c.nombre === this.filtroCategoria)
    );
  }

  toggleProfesor(profesor: any) {
    if (this.profesorSeleccionado?.id === profesor.id) {
      this.profesorSeleccionado = null;
    } else {
      this.profesorSeleccionado = profesor;
    }
  }

  getOpiniones(profesor: any): any[] {
    if (!profesor.opiniones) return [];
    return profesor.opiniones.slice(0, 2);
  }

  esNivelCompatible(profesor: any): boolean {
    if (!profesor.nivelAcademico) return true;
    
    const nivelProfe = profesor.nivelAcademico.toLowerCase();
    const nivelAlumno = this.alumnoNivelAcademico.toLowerCase();

    const niveles = ['primario', 'secundario', 'terciario', 'universitario', 'doctorado'];
    return niveles.indexOf(nivelProfe) >= niveles.indexOf(nivelAlumno);
  }
}