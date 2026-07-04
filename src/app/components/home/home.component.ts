import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AutenticacionService } from '../../services/autenticacion.service';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-home',
  imports: [RouterLink, BaseChartDirective],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent  {
  
  }