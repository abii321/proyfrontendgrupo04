import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TutoriaService } from '../../services/tutoria.service';
import { AutenticacionService } from '../../services/autenticacion.service';

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

  rol: string = '';
  categorias: any[] = [];
  profesores: any[] = [];
  filtroCategoria: string = '';
  profesorSeleccionado: any = null;
  alumnoNivelAcademico: string = 'universitario'; // Valor por defecto

  ngOnInit() {
    // Obtenemos los datos del usuario logueado directamente del sessionStorage
    const userStr = sessionStorage.getItem('usuario');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.rol = user.rol || ''; // Sacamos el rol de acá
      this.alumnoNivelAcademico = user.nivelAcademico || 'universitario';
    }

    this.cargarCategorias();
    this.cargarProfesores();
  }

  cargarCategorias() {
    this.tutoriaService.obtenerCategorias().subscribe({
      next: (res: any[]) => this.categorias = res,
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
    // Si el profesor no definió nivel, asumimos que es compatible por precaución
    if (!profesor.nivelAcademico) return true;
    
    const nivelProfe = profesor.nivelAcademico.toLowerCase();
    const nivelAlumno = this.alumnoNivelAcademico.toLowerCase();

    // Lógica básica: El profesor debe tener el mismo o mayor nivel
    const niveles = ['primario', 'secundario', 'terciario', 'universitario', 'doctorado'];
    return niveles.indexOf(nivelProfe) >= niveles.indexOf(nivelAlumno);
  }
}