import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { AdminService } from '../../services/admin.service';
import {
  DashboardSummary,
  FullTutorial,
  MonthCount,
  RoleCount,
  StateCount
} from '../../models/dashboard.class';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  // --- KPI CARDS ---
  summary: DashboardSummary = {
    totalUsers: 0,
    totalTutorials: 0,
    totalHelpRequests: 0,
    totalCategories: 0
  };

  // --- BAR CHART: Usuarios por rol ---
  barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{ data: [], label: 'Usuarios', backgroundColor: '#5a6b7c' }]
  };

  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } }
    }
  };

  // --- PIE CHART: Solicitudes por estado ---
  pieChartData: ChartData<'pie'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: ['#5a6b7c', '#7a9bb5', '#a8c5da', '#c8dde8', '#e2ecf3']
    }]
  };

  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' }
    }
  };

  // --- LINE CHART: Tutorías por mes ---
  lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Tutorías',
      borderColor: '#5a6b7c',
      backgroundColor: 'rgba(90,107,124,0.15)',
      fill: true,
      tension: 0.4
    }]
  };

  lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } }
    }
  };

  // --- DATA TABLE ---
  tutorials: FullTutorial[] = [];
  // TODO: cuando se instale angular-datatables, aplicar DataTableDirective a la tabla HTML
  // y configurar dtOptions / dtTrigger acá.

  constructor(private adminService: AdminService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadSummary();
    this.loadUsersByRole();
    this.loadHelpRequestsByState();
    this.loadTutorialsByMonth();
    this.loadFullTutorials();
  }

  // Carga los contadores generales para las KPI cards
  loadSummary(): void {
    this.adminService.getSummary().subscribe({
      next: (res) => {
        if (res.status === 1) {
          this.summary = res.data;
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Error loading summary:', err)
    });
  }

  // Carga usuarios por rol y configura el gráfico de barras
  loadUsersByRole(): void {
    this.adminService.getUsersByRole().subscribe({
      next: (res) => {
        if (res.status === 1) {
          const rows: RoleCount[] = res.data;
          this.barChartData = {
            labels: rows.map(r => r.rol),
            datasets: [{
              data: rows.map(r => Number(r.count)),
              label: 'Usuarios',
              backgroundColor: '#5a6b7c'
            }]
          };
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Error loading users by role:', err)
    });
  }

  // Carga solicitudes por estado y configura el gráfico de torta
  loadHelpRequestsByState(): void {
    this.adminService.getHelpRequestsByState().subscribe({
      next: (res) => {
        if (res.status === 1) {
          const rows: StateCount[] = res.data;
          this.pieChartData = {
            labels: rows.map(r => r.estado),
            datasets: [{
              data: rows.map(r => Number(r.count)),
              backgroundColor: ['#5a6b7c', '#7a9bb5', '#a8c5da', '#c8dde8', '#e2ecf3']
            }]
          };
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Error loading requests by state:', err)
    });
  }

  // Carga tutorías por mes y configura el gráfico de línea
  loadTutorialsByMonth(): void {
    this.adminService.getTutorialsByMonth().subscribe({
      next: (res) => {
        if (res.status === 1) {
          const rows: MonthCount[] = res.data;
          const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
          this.lineChartData = {
            labels: rows.map(r => monthNames[Number(r.month) - 1] ?? r.month),
            datasets: [{
              data: rows.map(r => Number(r.count)),
              label: 'Tutorías',
              borderColor: '#5a6b7c',
              backgroundColor: 'rgba(90,107,124,0.15)',
              fill: true,
              tension: 0.4
            }]
          };
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Error loading tutorials by month:', err)
    });
  }

  // Carga el listado completo de tutorías para la tabla
  loadFullTutorials(): void {
    this.adminService.getFullTutorials().subscribe({
      next: (res) => {
        if (res.status === 1) {
          this.tutorials = res.data;
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Error loading tutorials:', err)
    });
  }

  // Exporta el listado de tutorías a un archivo PDF
  exportToPDF(): void {
    const doc = new jsPDF();
    doc.setFontSize(13);
    doc.text('Reporte de Tutorías', 14, 15);

    autoTable(doc, {
      startY: 22,
      head: [['#', 'Alumno', 'Profesor', 'Categoría', 'Estado', 'Fecha']],
      body: this.tutorials.map(t => [
        t.id,
        `${t.alumno?.nombre ?? ''} ${t.alumno?.apellido ?? ''}`,
        `${t.profesor?.nombre ?? ''} ${t.profesor?.apellido ?? ''}`,
        t.categoria?.nombre ?? '',
        t.estado,
        new Date(t.createdAt).toLocaleDateString()
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [90, 107, 124] }
    });

    doc.save('reporte-tutorias.pdf');
  }

  // Exporta el listado de tutorías a un archivo Excel (.xlsx)
  exportToExcel(): void {
    const rows = this.tutorials.map(t => ({
      'ID': t.id,
      'Alumno': `${t.alumno?.nombre ?? ''} ${t.alumno?.apellido ?? ''}`,
      'Profesor': `${t.profesor?.nombre ?? ''} ${t.profesor?.apellido ?? ''}`,
      'Categoría': t.categoria?.nombre ?? '',
      'Estado': t.estado,
      'Fecha': new Date(t.createdAt).toLocaleDateString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tutorías');
    XLSX.writeFile(workbook, 'reporte-tutorias.xlsx');
  }
}
