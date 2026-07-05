import { Component, OnInit, OnDestroy, ChangeDetectorRef, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { AdminService } from '../../services/admin.service';
import {
  DashboardSummary,
  FullTutorial,
  MonthCount,
  RoleStateCount,
  StateCount
} from '../../models/dashboard.class';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import DataTable from 'datatables.net-bs5';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

  @ViewChild('tutorialsTable') tutorialsTable!: ElementRef<HTMLTableElement>;

  // --- KPI CARDS ---
  summary: DashboardSummary = {
    totalUsers: 0,
    totalTutorials: 0,
    totalHelpRequests: 0,
    totalCategories: 0,
    avgRating: '0.0'
  };

  // --- STACKED BAR CHART: Usuarios por rol (activos/inactivos) ---
  barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };

  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' }
    },
    scales: {
      x: { stacked: true },
      y: { stacked: true, beginAtZero: true, ticks: { stepSize: 1 } }
    }
  };

  // --- PIE CHART 1: Solicitudes por estado ---
  pieChartData: ChartData<'pie'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: ['#5a6b7c', '#7a9bb5', '#a8c5da']
    }]
  };

  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' }
    }
  };

  // --- PIE CHART 2: Tutorías por estado ---
  tutorialStatePieData: ChartData<'pie'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: ['#DDA77B', '#A3B19B', '#DDA7A5', '#9EADC8', '#6C8484']
    }]
  };

  tutorialStatePieOptions: ChartOptions<'pie'> = {
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

  // --- DATA TABLE (DataTable.net nativo) ---
  tableReady = false;
  tutorials = signal<FullTutorial[]>([]);
  private dtInstance: any;

  private readonly dtOptions = {
    language: {
      url: 'https://cdn.datatables.net/plug-ins/2.3.2/i18n/es-AR.json'
    },
    pageLength: 10,
    lengthMenu: [10, 25, 50, 100],
    columns: [
      { data: 'id', title: '#', className: 'text-muted small' },
      {
        data: null,
        title: 'Alumno',
        defaultContent: '',
        render: (d: any, type: string, row: FullTutorial) => {
          const nombre = `${row.alumno?.nombre ?? ''} ${row.alumno?.apellido ?? ''}`.trim();
          const email = row.alumno?.email ?? '';
          if (type !== 'display') return nombre;
          return `<div class="fw-semibold">${nombre}</div><small class="text-muted">${email}</small>`;
        }
      },
      {
        data: null,
        title: 'Profesor',
        defaultContent: '',
        render: (d: any, type: string, row: FullTutorial) => {
          const nombre = `${row.profesor?.nombre ?? ''} ${row.profesor?.apellido ?? ''}`.trim();
          const email = row.profesor?.email ?? '';
          if (type !== 'display') return nombre;
          return `<div class="fw-semibold">${nombre}</div><small class="text-muted">${email}</small>`;
        }
      },
      {
        data: 'categoria.nombre',
        title: 'Categoría',
        defaultContent: '—'
      },
      {
        data: 'modalidad',
        title: 'Modalidad',
        render: (d: string, type: string) => {
          if (type !== 'display') return d ?? '';
          return `<span class="badge-modalidad badge-modalidad--${(d ?? '').toLowerCase()}">${d}</span>`;
        }
      },
      {
        data: 'estado',
        title: 'Estado',
        render: (d: string, type: string) => {
          if (type !== 'display') return d ?? '';
          return `<span class="badge-estado badge-estado--${(d ?? '').toLowerCase()}">${d}</span>`;
        }
      },
      {
        data: 'pagada',
        title: 'Pagada',
        render: (d: boolean, type: string) => {
          if (type !== 'display') return d ? 'Sí' : 'No';
          const cls = d ? 'si' : 'no';
          return `<span class="badge-pagada--${cls}">${d ? 'Sí' : 'No'}</span>`;
        }
      },
      {
        data: 'calificacion.calificacion',
        title: 'Calific.',
        defaultContent: '0',
        render: (d: number, type: string) => {
          if (type !== 'display') return d ?? 0;
          if (!d) return '<span class="text-muted">—</span>';
          return `<span class="rating-cell" title="${d}/5">${'★'.repeat(d)}${'☆'.repeat(5 - d)}</span>`;
        }
      },
      {
        data: 'precioAcordado',
        title: 'Precio',
        className: 'fw-semibold',
        render: (d: number, type: string) => {
          if (type !== 'display') return d ?? 0;
          return `$${(d ?? 0).toFixed(2)}`;
        }
      },
      {
        data: 'fechaHora',
        title: 'Fecha de Clase',
        className: 'text-muted small',
        render: (d: string, type: string) => {
          if (!d) return '';
          if (type !== 'display') return d;
          return new Date(d).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
        }
      },
      {
        data: 'createdAt',
        title: 'Registro',
        className: 'text-muted small',
        render: (d: string, type: string) => {
          if (!d) return '';
          if (type !== 'display') return d;
          return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' });
        }
      }
    ],
    order: [[10, 'desc'] as [number, 'asc' | 'desc']]   // ordenar por "Registro" DESC
  };

  // --- KPIs FINANCIEROS ---
  get totalRevenue(): number {
    return this.tutorials()
      .filter(t => t.pagada)
      .reduce((sum, t) => sum + (t.precioAcordado || 0), 0);
  }

  get pendingRevenue(): number {
    return this.tutorials()
      .filter(t => !t.pagada && t.estado !== 'rechazada' && t.estado !== 'cancelada')
      .reduce((sum, t) => sum + (t.precioAcordado || 0), 0);
  }

  get averagePrice(): number {
    const list = this.tutorials();
    if (list.length === 0) return 0;
    const total = list.reduce((sum, t) => sum + (t.precioAcordado || 0), 0);
    return total / list.length;
  }

  get paymentRate(): number {
    const list = this.tutorials();
    if (list.length === 0) return 0;
    const paidCount = list.filter(t => t.pagada).length;
    return (paidCount / list.length) * 100;
  }

  constructor(private adminService: AdminService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadSummary();
    this.loadUsersByRole();
    this.loadHelpRequestsByState();
    this.loadTutorialsByState();
    this.loadTutorialsByMonth();
    this.loadFullTutorials();
  }

  ngOnDestroy(): void {
    if (this.dtInstance) {
      this.dtInstance.destroy();
    }
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

  // Carga usuarios por rol+estado y configura el gráfico de barras apilado
  loadUsersByRole(): void {
    this.adminService.getUsersByRole().subscribe({
      next: (res) => {
        if (res.status === 1) {
          const rows: RoleStateCount[] = res.data;

          // Extraer roles únicos preservando el orden del backend
          const roles = [...new Set(rows.map(r => r.rol))];

          const activosPorRol = roles.map(rol =>
            Number(rows.find(r => r.rol === rol && r.estado === 'activo')?.count ?? 0)
          );
          const inactivosPorRol = roles.map(rol =>
            Number(rows.find(r => r.rol === rol && r.estado === 'inactivo')?.count ?? 0)
          );

          this.barChartData = {
            labels: roles,
            datasets: [
              { data: activosPorRol, label: 'Activos', backgroundColor: '#A3B19B' },
              { data: inactivosPorRol, label: 'Inactivos', backgroundColor: '#DDA7A5' }
            ]
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
              backgroundColor: ['#5a6b7c', '#7a9bb5', '#a8c5da']
            }]
          };
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Error loading requests by state:', err)
    });
  }

  // Carga tutorías por estado y configura la segunda torta
  loadTutorialsByState(): void {
    this.adminService.getTutorialsByState().subscribe({
      next: (res) => {
        if (res.status === 1) {
          const rows: StateCount[] = res.data;
          this.tutorialStatePieData = {
            labels: rows.map(r => r.estado),
            datasets: [{
              data: rows.map(r => Number(r.count)),
              backgroundColor: ['#DDA77B', '#A3B19B', '#DDA7A5', '#9EADC8', '#6C8484']
            }]
          };
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Error loading tutorials by state:', err)
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

  // Carga el listado completo de tutorías; inicializa la tabla una vez cargada en el DOM
  loadFullTutorials(): void {
    this.adminService.getFullTutorials().subscribe({
      next: (res) => {
        if (res.status === 1) {
          this.tutorials.set(res.data);
          this.tableReady = true;
          this.cdr.detectChanges();

          // Inicializar DataTable nativo en la siguiente macro-tarea para asegurar que el elemento ya está renderizado
          setTimeout(() => {
            if (this.tutorialsTable && this.tutorialsTable.nativeElement) {
              if (this.dtInstance) {
                this.dtInstance.destroy();
              }
              this.dtInstance = new DataTable(this.tutorialsTable.nativeElement, {
                ...this.dtOptions,
                data: res.data
              });
            }
          }, 0);
        }
      },
      error: (err) => {
        console.error('Error loading tutorials:', err);
        this.tableReady = true;
        this.cdr.detectChanges();
      }
    });
  }

  // Exporta el listado de tutorías a PDF
  exportToPDF(): void {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(13);
    doc.text('Reporte de Tutorías', 14, 15);

    autoTable(doc, {
      startY: 22,
      head: [['#', 'Alumno', 'Email Alumno', 'Profesor', 'Email Profesor', 'Categoría', 'Modalidad', 'Estado', 'Pagada', 'Calific.', 'Precio', 'Fecha de Clase', 'Registro']],
      body: this.tutorials().map(t => [
        t.id,
        `${t.alumno?.nombre ?? ''} ${t.alumno?.apellido ?? ''}`,
        t.alumno?.email ?? '',
        `${t.profesor?.nombre ?? ''} ${t.profesor?.apellido ?? ''}`,
        t.profesor?.email ?? '',
        t.categoria?.nombre ?? '',
        t.modalidad,
        t.estado,
        t.pagada ? 'Sí' : 'No',
        t.calificacion ? `${t.calificacion.calificacion}/5` : '—',
        `$${t.precioAcordado.toFixed(2)}`,
        t.fechaHora ? new Date(t.fechaHora).toLocaleString() : '',
        new Date(t.createdAt).toLocaleDateString()
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [90, 107, 124] }
    });

    doc.save('reporte-tutorias.pdf');
  }

  // Exporta el listado de tutorías a Excel (.xlsx)
  exportToExcel(): void {
    const rows = this.tutorials().map(t => ({
      'ID': t.id,
      'Alumno': `${t.alumno?.nombre ?? ''} ${t.alumno?.apellido ?? ''}`,
      'Email Alumno': t.alumno?.email ?? '',
      'Profesor': `${t.profesor?.nombre ?? ''} ${t.profesor?.apellido ?? ''}`,
      'Email Profesor': t.profesor?.email ?? '',
      'Categoría': t.categoria?.nombre ?? '',
      'Modalidad': t.modalidad,
      'Estado': t.estado,
      'Pagada': t.pagada ? 'Sí' : 'No',
      'Calificación': t.calificacion ? t.calificacion.calificacion : null,
      'Comentario': t.calificacion?.comentario ?? '',
      'Precio': t.precioAcordado,
      'Fecha de Clase': t.fechaHora ? new Date(t.fechaHora).toLocaleString() : '',
      'Fecha Registro': new Date(t.createdAt).toLocaleDateString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tutorías');
    XLSX.writeFile(workbook, 'reporte-tutorias.xlsx');
  }
}
