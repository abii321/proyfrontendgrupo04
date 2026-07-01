import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AutenticacionService } from '../../services/autenticacion.service';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-mis-solicitudes',
  imports: [RouterLink, BaseChartDirective],
  templateUrl: './mis-solicitudes.component.html',
  styleUrl: './mis-solicitudes.component.css',
})
export class MisSolicitudesComponent implements OnInit {
  rol: string = '';
  nombreCompleto: string = '';
  carrera: string = '';
  universidad: string = '';

  alumnoTutoriasSolicitadas = 6;
  alumnoTutoriasCompletadas = 4;
  alumnoProximaTutoria = 'Mañana a las 16:00 - Álgebra';
  alumnoCategoriasConsultadas = 2;

  alumnoDonaData = {
    labels: ['Programación', 'Matemáticas', 'Inglés', 'Física'],
    datasets: [{ data: [3, 2, 1, 0], backgroundColor: ['#0d6efd', '#ffc107', '#198754', '#6c757d'] }]
  };

  alumnoBarrasData = {
    labels: ['Marzo', 'Abril', 'Mayo', 'Junio'],
    datasets: [{ data: [1, 2, 1, 2], label: 'Tutorías Solicitadas', backgroundColor: '#0d6efd', borderRadius: 4 }]
  };

  profesorTutoriasPendientes = 2;
  profesorTutoriasCompletadas = 15;
  profesorHorasDictadas = 30;
  profesorCalificacionPromedio = 4.9;

  profesorBarrasData = {
    labels: ['Marzo', 'Abril', 'Mayo', 'Junio'],
    datasets: [{ data: [5, 10, 8, 12], label: 'Horas Dictadas', backgroundColor: '#0d6efd', borderRadius: 4 }]
  };

  profesorDonaData = {
    labels: ['Excelente (5★)', 'Muy Bueno (4★)', 'Regular (3★)'],
    datasets: [{ data: [12, 2, 1], backgroundColor: ['#198754', '#ffc107', '#dc3545'] }]
  };

  chartOptionsDoughnut = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const
      }
    }
  };

  chartOptionsBar = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  authService = inject(AutenticacionService);
  private router = inject(Router);

  ngOnInit(): void {
    if (!this.authService.userLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    const userStr = sessionStorage.getItem('usuario');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.rol = user.rol;
      this.nombreCompleto = `${user.nombre} ${user.apellido}`;
      this.carrera = user.carrera;
      this.universidad = user.universidad;
    }
  }
}
