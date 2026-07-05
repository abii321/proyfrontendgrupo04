import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TutoriaService } from '../../services/tutoria.service';
import { AutenticacionService } from '../../services/autenticacion.service';
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
  private categoriaService = inject(CategoriaService); 
  private cdr = inject(ChangeDetectorRef);

  rol: string = '';
  categorias: any[] = [];
  profesores: any[] = [];
  filtroCategoria: string = '';
  profesorSeleccionado: any = null;
  alumnoNivelAcademico: string = 'universitario';
  perfilIncompleto: boolean = false;  
  criterioOrden: string = 'predeterminado';
  alumnoLat: number | null = null;
  alumnoLng: number | null = null;

  ngOnInit() {
    const userStr = sessionStorage.getItem('usuario');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.rol = user.rol || '';
      this.alumnoNivelAcademico = user.nivelAcademico || 'universitario';
      this.alumnoLat = user.lat || null;
      this.alumnoLng = user.lng || null;
      if ((this.rol || '').toLowerCase() === 'profesor') {
        if (!user.universidad || !user.carrera || !user.biografia) {
          this.perfilIncompleto = true;
        }
      }
    }

    this.cargarCategorias();
    this.cargarProfesores();
  }

  cargarCategorias() {
    //  Usar el nuevo servicio en vez del viejo tutoriaService
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
      next: (res: any) => {
        const listado = res.data || res;
        
        // Verificamos si realmente es una lista (array)
        if (Array.isArray(listado)) {
            // Filtramos a los profes y los guardamos
            this.profesores = listado.filter((u: any) => (u.rol || '').toLowerCase() === 'profesor');
            console.log(" Profesores encontrados y listos para mostrar:", this.profesores);
            this.cdr.detectChanges();
        } else {
            console.error(" El backend no mandó una lista válida:", listado);
        }
      },
      error: (err: any) => {
        console.error(' Error gigante al cargar profesores desde el backend:', err);
      }
    });
  }

  calcularDistancia(lat1: number | null | undefined, lon1: number | null | undefined, lat2: number | null | undefined, lon2: number | null | undefined): number {
    if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
      return Infinity;
    }
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  detectarUbicacionGPSAlumno() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.alumnoLat = position.coords.latitude;
          this.alumnoLng = position.coords.longitude;
          this.cdr.detectChanges();
        },
        (error) => {
          console.error('Error al obtener ubicación:', error);
          alert('No se pudo obtener tu ubicación para calcular la distancia.');
          this.criterioOrden = 'predeterminado';
          this.cdr.detectChanges();
        }
      );
    } else {
      alert('Tu navegador no soporta geolocalización.');
      this.criterioOrden = 'predeterminado';
    }
  }

  ordenarCambio() {
    if (this.criterioOrden === 'cercania' && (!this.alumnoLat || !this.alumnoLng)) {
      this.detectarUbicacionGPSAlumno();
    }
  }

  get profesoresFiltrados() {
    let list = this.profesores;
    
    if (this.filtroCategoria) {
      list = list.filter(p => 
        (p.categoriasEnseniadas || []).some((c: any) => c.nombre === this.filtroCategoria)
      );
    }

    if (this.criterioOrden === 'cercania' && this.alumnoLat != null && this.alumnoLng != null) {
      list = [...list].sort((a, b) => {
        const distA = this.calcularDistancia(this.alumnoLat, this.alumnoLng, a.lat, a.lng);
        const distB = this.calcularDistancia(this.alumnoLat, this.alumnoLng, b.lat, b.lng);
        return distA - distB;
      });
    }

    return list;
  }

  toggleProfesor(profesor: any) {
    if (this.profesorSeleccionado?.id === profesor.id) {
      this.profesorSeleccionado = null;
    } else {
      this.profesorSeleccionado = profesor;
    }
  }

  getOpiniones(profesor: any): { id: number, alumno: string, calificacion: number, comentario: string }[] {
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