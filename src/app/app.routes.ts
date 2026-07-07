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
import { adminGuard } from './guards/admin.guard';
import { PagoExitoso } from './components/pago-exitoso/pago-exitoso';
import { PagoPendiente} from './components/pago-pendiente/pago-pendiente';
import { PagoError} from './components/pago-error/pago-error';

import { DashboardComponent } from './components/dashboard/dashboard.component';



export const routes: Routes = [
    { path: 'home', component: HomeComponent },
    { path: 'registro', component: RegistroComponent },
    { path: 'login', component: LoginComponent },
    { path: 'perfil', component: PerfilComponent, canActivate: [authGuard] },
    { path: 'solicitud-ayuda', component: SolicitudAyudaComponent, canActivate: [authGuard] },
    { path: 'solicitud-ayuda/nueva', component: CrearSolicitudComponent, canActivate: [authGuard] },
    { path: 'solicitudes/:id', component: RespuestaAyudaComponent, canActivate: [authGuard] },
    { path: 'mis-solicitudes', component: MisSolicitudesComponent, canActivate: [authGuard] },
    { path: 'gestion-tutoria', component: GestionTutoriaComponent, canActivate: [authGuard] },
    { path: 'solicitar-tutoria', component: GaleriaProfesoresComponent, canActivate: [authGuard] },
    { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard, adminGuard] },
    { path: 'pago-exitoso', component: PagoExitoso, canActivate: [authGuard] },
    { path: 'pago-pendiente', component: PagoPendiente, canActivate: [authGuard] },
    { path: 'pago-error', component: PagoError, canActivate: [authGuard] },
    { path: '**', pathMatch: 'full', redirectTo: 'home' },
];
