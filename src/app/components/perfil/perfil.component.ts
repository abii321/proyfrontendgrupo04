import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Usuario } from '../../models/usuario.class';
import { Categoria } from '../../models/categoria.class';
import { CategoriaService } from '../../services/categoria.service';
import { Precio } from '../../models/precio.class';
import { PrecioService } from '../../services/precio.service';

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

  constructor( private categoriaService: CategoriaService, private precioService: PrecioService ){ 
    this.usuario = new Usuario();
  }

  ngOnInit(){
    this.categoriaService.obtenerCategorias().subscribe({ next: data => this.categorias = data });
    this.precioService.obtenerPrecios().subscribe({ next: data => this.precios = data });
  }

}
