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

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule ],
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

  nuevoHorario: HorarioDisponible;
  horarios: Array<HorarioDisponible> = [];

  profesorId = sessionStorage.getItem("usuario")? JSON.parse(sessionStorage.getItem("usuario")!).id : 0; 

  constructor( private categoriaService: CategoriaService, private precioService: PrecioService, private cdr: ChangeDetectorRef,
    private profesorService: ProfesorService, private horarioService : HorarioDisponibleService
   ){ 
    this.usuario = new Usuario();
    this.nuevoHorario = new HorarioDisponible();
  }

  ngOnInit(){
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
        this.cdr.detectChanges();
      },
      ( error: any ) => {
        console.log(error);
      }
    )
  }
  mostrarDescripcion(cat:Categoria){
    this.categoriaInfo = cat;
  }

  agregarHorario(){
    this.horarioService.agregarHorario( this.nuevoHorario, this.profesorId ).subscribe(
      ( result: any ) => {
        this.horarios.push(result.data);
        this.nuevoHorario = new HorarioDisponible();
        this.cdr.detectChanges();
      },
      ( error: any ) => {
        console.log(error);
      }
    )
  }

  eliminarHorario( horarioId: number ){
    this.horarioService.eliminarHorario( horarioId ).subscribe(
      ( result: any ) => {
        this.horarios = this.horarios.filter(h => h.id !== horarioId);
        this.cdr.detectChanges();
      },
      ( error: any ) => {
        console.log(error);
      }
    )
  }

}
