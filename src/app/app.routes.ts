import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { RegistroComponent } from './components/registro/registro.component';
import { LoginComponent } from './components/login/login.component';
import { PerfilComponent } from './components/perfil/perfil.component';
import { SolicitudAyudaComponent } from './components/solicitud-ayuda/solicitud-ayuda.component/solicitud-ayuda.component';
import { RespuestaAyudaComponent } from './components/respuesta-ayuda/respuesta-ayuda.component/respuesta-ayuda.component';
import { GestionTutoriaComponent } from './components/gestion-tutoria/gestion-tutoria.component';
import { MisSolicitudesComponent } from './components/mis-solicitudes/mis-solicitudes.component';
import { CrearSolicitudComponent } from './components/solicitud-ayuda/crear-solicitud/crear-solicitud.component';
import { GaleriaProfesoresComponent } from './components/galeria-profesores/galeria-profesores.component';
import { authGuard } from './guards/auth.guard';
import { DashboardComponent } from './components/dashboard/dashboard.component';

export const routes: Routes = [
    { path: 'home', component: HomeComponent, canActivate: [authGuard] },
    { path: 'registro', component: RegistroComponent },
    { path: 'login', component: LoginComponent },
    { path: 'perfil', component: PerfilComponent, canActivate: [authGuard] },
    { path: 'solicitud-ayuda', component: SolicitudAyudaComponent, canActivate: [authGuard] },
    { path: 'solicitud-ayuda/nueva', component: CrearSolicitudComponent, canActivate: [authGuard] },
    { path: 'solicitudes/:id', component: RespuestaAyudaComponent, canActivate: [authGuard] },
    { path: 'mis-solicitudes', component: MisSolicitudesComponent, canActivate: [authGuard] },
    { path: 'gestion-tutoria', component: GestionTutoriaComponent, canActivate: [authGuard] },
    { path: 'solicitar-tutoria', component: GaleriaProfesoresComponent, canActivate: [authGuard] },
    { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },

    { path: '**', pathMatch: 'full', redirectTo: 'home' },
];
