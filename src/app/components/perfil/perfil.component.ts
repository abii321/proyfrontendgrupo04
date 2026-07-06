import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Form, FormsModule, NgForm } from '@angular/forms';
import { Usuario } from '../../models/usuario.class';
import { Categoria } from '../../models/categoria.class';
import { CategoriaService } from '../../services/categoria.service';
import { Precio } from '../../models/precio.class';
import { PrecioService } from '../../services/precio.service';
import { HorarioDisponible } from '../../models/horario-disponible.class';
import { ProfesorService } from '../../services/profesor.service';
import { HorarioDisponibleService } from '../../services/horario-disponible.service';
import { RouterLink } from "@angular/router";
import { AutenticacionService } from '../../services/autenticacion.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  usuario : Usuario;
  categorias: Array<Categoria> = [];
  precios: Array<Precio> = [];
  
  textoBusqueda: string = '';
  filtroNivel: string = '';
  categoriasFiltradas: Array<Categoria> = [];
  categoriasSeleccionadas: Array<Categoria> = [];
  categoriaInfo: Categoria = new Categoria();
  errorCategoria: string = '';

  nuevoHorario: HorarioDisponible;
  horarios: Array<HorarioDisponible> = [];
  errorHorario: string = '';

  modoEdicion: boolean = false;
  backupUsuario: any = null;

  rolUsuario = sessionStorage.getItem("usuario")? JSON.parse(sessionStorage.getItem("usuario")!).rol : 'null';
  profesorId = sessionStorage.getItem("usuario")? JSON.parse(sessionStorage.getItem("usuario")!).id : 0; 

  constructor( private categoriaService: CategoriaService, private precioService: PrecioService, private cdr: ChangeDetectorRef,
    private profesorService: ProfesorService, private horarioService : HorarioDisponibleService,
    private autenticacionService: AutenticacionService
   ){ 
    this.usuario = new Usuario();
    this.nuevoHorario = new HorarioDisponible();
  }

  ngOnInit(){
    const userStr = sessionStorage.getItem("usuario");
    if (userStr) {
      this.usuario = JSON.parse(userStr); 
    }
    this.categoriaService.obtenerCategorias().subscribe({
        next: (res: any) => {
            this.categorias = res.data;
            this.cdr.detectChanges();
        }
    });

    this.precioService.obtenerPrecios().subscribe({
        next: (res: any) => {
            this.precios = res.data;
            this.cdr.detectChanges();
        }
    });

    // traer datos ya existentes
    this.horarioService.obtenerHorarios(this.profesorId).subscribe({
        next: (res: any) => {
            this.horarios = res.data;
            this.cdr.detectChanges(); 
        }
    });

    this.categoriaService.obtenerCategoriasdeProfesor(this.profesorId).subscribe({
      next: (res: any) => {
          this.categoriasSeleccionadas = res.data; 
          this.filtrarCategorias();
          this.cdr.detectChanges();
          console.log(res.data);
      }
    });
  }

  filtrarCategorias(){
    const texto = this.textoBusqueda.toLowerCase();
    this.categoriasFiltradas = this.categorias.filter(c => {
      const coincideTexto = c.nombre.toLowerCase().includes(texto);
      const coincideNivel = !this.filtroNivel || c.nivel === this.filtroNivel;
      const noSeleccionada = !this.categoriasSeleccionadas.some(x => x.id == c.id);

      return coincideTexto && coincideNivel && noSeleccionada;
    });
  }
  agregarCategoria(cat:Categoria){
    this.categoriaService.asociarProfesor(cat.id, this.profesorId).subscribe(
      ( result: any ) => {
        this.categoriasSeleccionadas.push(cat);
        this.filtrarCategorias();
        this.cdr.detectChanges();
      },
      ( error: any ) => {
        console.log(error);
      }
    ) 
  }
  quitarCategoria(cat:Categoria){
    this.categoriaService.desasociarProfesor(cat.id, this.profesorId).subscribe(
      ( result: any ) => {
        this.categoriasSeleccionadas = this.categoriasSeleccionadas.filter( x => x.id != cat.id );
        this.filtrarCategorias();
        this.errorCategoria = '';
        this.cdr.detectChanges();
      },
      ( error: any ) => {
        this.errorCategoria = error.error?.msg || 'Ocurrió un error inesperado.';
      } 
    )
  }
  mostrarDescripcion(cat:Categoria){
    this.categoriaInfo = cat;
  }

  agregarHorario( form:NgForm){
    this.errorHorario = '';
    if (this.nuevoHorario.horaInicio >= this.nuevoHorario.horaFin) {
      this.errorHorario = 'La hora de inicio debe ser anterior a la hora de fin.';
      return;
    }
    if (this.haySuperposicion()) {
      this.errorHorario = 'Ya existe un horario que se superpone ese día.';
      return;
    }
    
    this.horarioService.agregarHorario( this.nuevoHorario, this.profesorId ).subscribe(
      ( result: any ) => {
        this.horarios.push(result.data);
        this.nuevoHorario = new HorarioDisponible();
        form.reset();
        this.cdr.detectChanges();
      },
      ( error: any ) => {
        console.log(error);
      }
    )
  }

  haySuperposicion(): boolean {
    return this.horarios .some(h =>
      this.nuevoHorario.diaSemana === this.nuevoHorario.diaSemana &&
      this.nuevoHorario.horaInicio < h.horaFin &&
      this.nuevoHorario.horaFin > h.horaInicio
  );

}

  eliminarHorario( horarioId: number ){
    this.horarioService.eliminarHorario( horarioId ).subscribe(
      ( result: any ) => {
        this.horarios = this.horarios.filter(h => h.id !== horarioId);
        this.cdr.detectChanges();
      },
      ( error: any ) => {
        this.errorHorario = error.error?.msg || 'Ocurrió un error inesperado.';
      }
    )
  }

  activarEdicion() {
    this.backupUsuario = JSON.parse(JSON.stringify(this.usuario));
    this.modoEdicion = true;
  }

  cancelarEdicion() {
    if (this.backupUsuario) {
      this.usuario = JSON.parse(JSON.stringify(this.backupUsuario));
    }
    this.modoEdicion = false;
  }

  guardarEdicion() {
    if (!this.usuario.nombre || !this.usuario.apellido) {
      alert('Nombre y apellido son campos requeridos.');
      return;
    }

    this.autenticacionService.updateUsuario(this.profesorId, this.usuario).subscribe({
      next: (res: any) => {
        if (res.status === '1') {
          const userStr = sessionStorage.getItem("usuario");
          if (userStr) {
            const currentUser = JSON.parse(userStr);
            const updatedUser = { ...currentUser, ...this.usuario };
            sessionStorage.setItem("usuario", JSON.stringify(updatedUser));
          }
          this.modoEdicion = false;
          alert('Perfil actualizado con éxito.');
          this.cdr.detectChanges();
        } else {
          alert('Error al actualizar el perfil: ' + res.msg);
        }
      },
      error: (err: any) => {
        console.error('Error actualizando perfil:', err);
        alert('Ocurrió un error al intentar actualizar el perfil.');
      }
    });
  }

}
