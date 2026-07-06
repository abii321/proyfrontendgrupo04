import { Component, OnInit, OnDestroy, ChangeDetectorRef, signal, ViewChild, ElementRef, HostListener } from '@angular/core';
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
  StateCount,
  FullUsuarioDashboard,
  FullCategoryDashboard
} from '../../models/dashboard.class';
import { Router } from '@angular/router';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import DataTable from 'datatables.net-bs5';

/**
  Escapa caracteres especiales HTML para prevenir XSS
  en celdas de DataTables que usan render() con HTML manual.
 */
function escapeHtml(value: string | null | undefined): string {
  if (!value) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

  @ViewChild('tutorialsTable') tutorialsTable!: ElementRef<HTMLTableElement>;
  @ViewChild('usersTable') usersTable!: ElementRef<HTMLTableElement>;
  @ViewChild('categoriesTable') categoriesTable!: ElementRef<HTMLTableElement>;
  @ViewChild('tableContainer') tableContainer!: ElementRef<HTMLDivElement>;

  currentTableView: 'tutorias' | 'usuarios' | 'categorias' = 'tutorias';

  users = signal<FullUsuarioDashboard[]>([]);
  categories = signal<FullCategoryDashboard[]>([]);

  editingUser: FullUsuarioDashboard | null = null;
  showUserModal = false;

  editingTutorial: FullTutorial | null = null;
  showTutorialModal = false;

  editingCategory: FullCategoryDashboard | null = null;
  showCategoryModal = false;

  itemToDelete: { type: string, id: number } | null = null;
  showDeleteModal = false;
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
          const nombre = escapeHtml(`${row.alumno?.nombre ?? ''} ${row.alumno?.apellido ?? ''}`.trim());
          const email = escapeHtml(row.alumno?.email);
          if (type !== 'display') return nombre;
          return `<div class="fw-semibold">${nombre}</div><small class="text-muted">${email}</small>`;
        }
      },
      {
        data: null,
        title: 'Profesor',
        defaultContent: '',
        render: (d: any, type: string, row: FullTutorial) => {
          const nombre = escapeHtml(`${row.profesor?.nombre ?? ''} ${row.profesor?.apellido ?? ''}`.trim());
          const email = escapeHtml(row.profesor?.email);
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
          const safe = escapeHtml(d);
          return `<span class="badge-modalidad badge-modalidad--${(d ?? '').toLowerCase()}">${safe}</span>`;
        }
      },
      {
        data: 'estado',
        title: 'Estado',
        render: (d: string, type: string) => {
          if (type !== 'display') return d ?? '';
          const safe = escapeHtml(d);
          return `<span class="badge-estado badge-estado--${(d ?? '').toLowerCase()}">${safe}</span>`;
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
      },
      {
        data: null,
        title: 'Acciones',
        orderable: false,
        render: (d: any, type: string, row: FullTutorial) => {
          return `
            <button class="btn btn-sm btn-outline-secondary btn-edit-tutorial me-1" data-id="${row.id}"><i class="bi bi-pencil pe-none"></i></button>
            <button class="btn btn-sm btn-outline-danger btn-delete-tutorial" data-id="${row.id}"><i class="bi bi-trash pe-none"></i></button>
          `;
        }
      }
    ],
    order: [[10, 'desc'] as [number, 'asc' | 'desc']]   // ordenar por "Registro" DESC
  };

  private readonly dtOptionsUsers = {
    language: {
      url: 'https://cdn.datatables.net/plug-ins/2.3.2/i18n/es-AR.json'
    },
    pageLength: 10,
    lengthMenu: [10, 25, 50, 100],
    columns: [
      { data: 'id', title: '#', className: 'text-muted small' },
      {
        data: null,
        title: 'Usuario',
        render: (d: any, type: string, row: FullUsuarioDashboard) => {
          const nombre = escapeHtml(`${row.nombre ?? ''} ${row.apellido ?? ''}`.trim());
          const email = escapeHtml(row.email);
          if (type !== 'display') return nombre;
          return `<div class="fw-semibold">${nombre}</div><small class="text-muted">${email}</small>`;
        }
      },
      {
        data: 'rol', title: 'Rol', render: (d: string, type: string) => {
          if (type !== 'display') return d ?? '';
          const bg = d === 'admin' ? 'bg-danger' : (d === 'profesor' ? 'bg-primary' : 'bg-secondary');
          return `<span class="badge ${bg}">${escapeHtml(d)}</span>`;
        }
      },
      {
        data: 'estado', title: 'Estado', render: (d: string, type: string) => {
          if (type !== 'display') return d ?? '';
          const bg = d === 'activo' ? 'bg-success' : 'bg-warning text-dark';
          return `<span class="badge ${bg}">${escapeHtml(d)}</span>`;
        }
      },
      { data: 'universidad', title: 'Universidad', defaultContent: '—' },
      { data: 'carrera', title: 'Carrera', defaultContent: '—' },
      {
        data: 'createdAt',
        title: 'Registro',
        className: 'text-muted small',
        render: (d: string, type: string) => {
          if (!d) return '';
          if (type !== 'display') return d;
          return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' });
        }
      },
      {
        data: null,
        title: 'Acciones',
        orderable: false,
        render: (d: any, type: string, row: FullUsuarioDashboard) => {
          return `<button class="btn btn-sm btn-outline-secondary btn-edit-user" data-id="${row.id}"><i class="bi bi-pencil pe-none"></i> Editar</button>`;
        }
      }
    ],
    order: [[6, 'desc'] as [number, 'asc' | 'desc']]
  };

  private readonly dtOptionsCategories = {
    language: { url: 'https://cdn.datatables.net/plug-ins/2.3.2/i18n/es-AR.json' },
    pageLength: 10,
    lengthMenu: [10, 25, 50, 100],
    columns: [
      { data: 'id', title: '#', className: 'text-muted small' },
      { data: 'nombre', title: 'Nombre', className: 'fw-semibold' },
      { data: 'nivel', title: 'Nivel' },
      {
        data: 'descripcion', title: 'Descripción', render: (d: string, type: string) => {
          if (type !== 'display') return d ?? '';
          const safe = escapeHtml(d);
          return safe.length > 50 ? safe.substring(0, 50) + '...' : safe;
        }
      },
      {
        data: null, title: 'Acciones', orderable: false, render: (d: any, type: string, row: FullCategoryDashboard) => {
          return `
            <button class="btn btn-sm btn-outline-secondary btn-edit-category me-1" data-id="${row.id}"><i class="bi bi-pencil pe-none"></i></button>
            <button class="btn btn-sm btn-outline-danger btn-delete-category" data-id="${row.id}"><i class="bi bi-trash pe-none"></i></button>
          `;
        }
      }
    ],
    order: [[1, 'asc'] as [number, 'asc' | 'desc']]
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

  constructor(private adminService: AdminService, private cdr: ChangeDetectorRef, private router: Router) { }

  ngOnInit(): void {
    this.loadSummary();
    this.loadUsersByRole();
    this.loadHelpRequestsByState();
    this.loadTutorialsByState();
    this.loadTutorialsByMonth();
    this.loadFullTutorials();
  }

  @HostListener('click', ['$event'])
  onTableClick(event: Event) {
    const target = event.target as HTMLElement;
    const actionBtn = target.closest('button');
    if (!actionBtn) return;

    const id = Number(actionBtn.getAttribute('data-id'));
    if (!id) return;

    if (actionBtn.classList.contains('btn-edit-user')) {
      const user = this.users().find(u => u.id === id);
      if (user) this.openEditUserModal(user);
    } else if (actionBtn.classList.contains('btn-edit-tutorial')) {
      const tutoria = this.tutorials().find(t => t.id === id);
      if (tutoria) this.openEditTutorialModal(tutoria);
    } else if (actionBtn.classList.contains('btn-delete-tutorial')) {
      this.openDeleteModal('tutorial', id);
    } else if (actionBtn.classList.contains('btn-edit-category')) {
      const cat = this.categories().find(c => c.id === id);
      if (cat) this.openEditCategoryModal(cat);
    } else if (actionBtn.classList.contains('btn-delete-category')) {
      this.openDeleteModal('category', id);
    }
  }

  goToSolicitudes(): void {
    this.router.navigate(['/solicitud-ayuda']);
  }

  switchView(view: 'tutorias' | 'usuarios' | 'categorias'): void {
    if (this.currentTableView !== view) {
      this.currentTableView = view;
      this.tableReady = false;

      if (this.dtInstance) {
        this.dtInstance.destroy();
        this.dtInstance = null;
      }

      if (view === 'tutorias') {
        this.loadFullTutorials();
      } else if (view === 'usuarios') {
        this.loadUsers();
      } else if (view === 'categorias') {
        this.loadCategories();
      }
    }

    setTimeout(() => {
      if (this.tableContainer && this.tableContainer.nativeElement) {
        this.tableContainer.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
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

  // Carga usuarios para la vista de usuarios
  loadUsers(): void {
    this.adminService.getUsers().subscribe({
      next: (res) => {
        if (res.status === 1) {
          this.users.set(res.data);
          this.tableReady = true;
          this.cdr.detectChanges();

          setTimeout(() => {
            if (this.usersTable && this.usersTable.nativeElement) {
              if (this.dtInstance) {
                this.dtInstance.destroy();
              }
              this.dtInstance = new DataTable(this.usersTable.nativeElement, {
                ...this.dtOptionsUsers,
                data: res.data
              });
            }
          }, 0);
        }
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.tableReady = true;
        this.cdr.detectChanges();
      }
    });
  }

  openEditUserModal(user: FullUsuarioDashboard): void {
    this.editingUser = { ...user };
    this.showUserModal = true;
    this.cdr.detectChanges();
  }

  closeUserModal(): void {
    this.showUserModal = false;
    this.editingUser = null;
  }

  saveUserChanges(): void {
    if (!this.editingUser) return;

    this.adminService.updateUser(this.editingUser.id, this.editingUser).subscribe({
      next: (res) => {
        if (res.status === 1) {
          this.closeUserModal();
          this.loadUsers(); // Recargar la tabla
        } else {
          alert('Error al actualizar usuario: ' + res.msg);
        }
      },
      error: (err) => {
        console.error('Error updating user:', err);
        alert('Ocurrió un error al actualizar el usuario.');
      }
    });
  }

  // --- TUTORIALS EDIT ---
  openEditTutorialModal(tutoria: FullTutorial): void {
    this.editingTutorial = { ...tutoria };
    this.showTutorialModal = true;
    this.cdr.detectChanges();
  }

  closeTutorialModal(): void {
    this.showTutorialModal = false;
    this.editingTutorial = null;
  }

  saveTutorialChanges(): void {
    if (!this.editingTutorial) return;
    this.adminService.updateTutorial(this.editingTutorial.id, this.editingTutorial).subscribe({
      next: (res) => {
        if (res.status === 1) {
          this.closeTutorialModal();
          this.loadFullTutorials();
        } else alert('Error: ' + res.msg);
      },
      error: (err) => {
        console.error(err);
        alert('Error al actualizar tutoría.');
      }
    });
  }

  // --- CATEGORIES (CATEGORÍAS) ---
  loadCategories(): void {
    this.adminService.getCategoriesList().subscribe({
      next: (res) => {
        if (res.status === 1) {
          this.categories.set(res.data);
          this.tableReady = true;
          this.cdr.detectChanges();
          setTimeout(() => {
            if (this.categoriesTable && this.categoriesTable.nativeElement) {
              if (this.dtInstance) this.dtInstance.destroy();
              this.dtInstance = new DataTable(this.categoriesTable.nativeElement, {
                ...this.dtOptionsCategories, data: res.data
              });
            }
          }, 0);
        }
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.tableReady = true;
        this.cdr.detectChanges();
      }
    });
  }

  openEditCategoryModal(cat: FullCategoryDashboard): void {
    this.editingCategory = { ...cat };
    this.showCategoryModal = true;
    this.cdr.detectChanges();
  }

  closeCategoryModal(): void {
    this.showCategoryModal = false;
    this.editingCategory = null;
  }

  saveCategoryChanges(): void {
    if (!this.editingCategory) return;
    this.adminService.updateCategory(this.editingCategory.id, this.editingCategory).subscribe({
      next: (res) => {
        if (res.status === 1) {
          this.closeCategoryModal();
          this.loadCategories();
        } else alert('Error: ' + res.msg);
      },
      error: (err) => {
        console.error(err);
        alert('Error al actualizar categoría.');
      }
    });
  }

  // --- DELETE MODAL ---
  openDeleteModal(type: string, id: number): void {
    this.itemToDelete = { type, id };
    this.showDeleteModal = true;
    this.cdr.detectChanges();
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.itemToDelete = null;
  }

  confirmDelete(): void {
    if (!this.itemToDelete) return;
    const { type, id } = this.itemToDelete;

    let deleteObs;
    if (type === 'tutorial') deleteObs = this.adminService.deleteTutorial(id);
    else if (type === 'category') deleteObs = this.adminService.deleteCategory(id);
    else return;

    deleteObs.subscribe({
      next: (res) => {
        if (res.status === 1) {
          this.closeDeleteModal();
          if (type === 'tutorial') this.loadFullTutorials();
          else if (type === 'category') this.loadCategories();
        } else {
          alert('Error: ' + res.msg);
        }
      },
      error: (err) => {
        console.error(err);
        if (err.error && err.error.msg) {
          alert(err.error.msg);
        } else {
          alert('Error al eliminar el registro.');
        }
        this.closeDeleteModal();
      }
    });
  }
}
