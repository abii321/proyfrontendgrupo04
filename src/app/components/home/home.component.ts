import { ChangeDetectorRef, Component, NgModule, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
// import { AutenticacionService } from '../../services/autenticacion.service'; // Not directly used in template, can be removed if not used elsewhere in TS
import { BaseChartDirective } from 'ng2-charts';
import { CategoriaService } from '../../services/categoria.service';
import { Categoria } from '../../models/categoria.class';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  imports: [RouterLink, CommonModule, FormsModule ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  categorias: Array<Categoria> = [];

  constructor( private categoriaService: CategoriaService, private cdr: ChangeDetectorRef, private router: Router /*, private authService: AutenticacionService */) { } // authService not used in this component's logic
  
  ngOnInit(){
    this.categoriaService.obtenerCategorias().subscribe({
        next: (res: any) => {
            this.categorias = res.data;
            this.cdr.detectChanges();
        }
    });
  }
}