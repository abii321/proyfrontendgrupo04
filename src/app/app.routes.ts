import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { RegistroComponent } from './components/registro/registro.component';
import { LoginComponent } from './components/login/login.component';
import { PerfilComponent } from './components/perfil/perfil.component';
import { SolicitudAyudaComponent } from './components/solicitud-ayuda/solicitud-ayuda.component/solicitud-ayuda.component';
import { RespuestaAyudaComponent } from './components/respuesta-ayuda/respuesta-ayuda.component/respuesta-ayuda.component';
import { SolicitarTutoriaComponent } from './components/tutoria/solicitar-tutoria.component/solicitar-tutoria.component';
import { GestionarTutoriasComponent } from './components/tutoria/gestionar-tutorias.component/gestionar-tutorias.component';
import { MisSolicitudesComponent } from './components/mis-solicitudes/mis-solicitudes.component';
import { CrearSolicitudComponent } from './components/solicitud-ayuda/crear-solicitud/crear-solicitud.component';

export const routes: Routes = [
    { path: 'home', component: HomeComponent },
    { path: 'registro', component: RegistroComponent },
    { path: 'login', component: LoginComponent },
    { path: 'perfil', component: PerfilComponent },
    { path: 'solicitud-ayuda', component: SolicitudAyudaComponent },
    { path: 'solicitud-ayuda/nueva', component: CrearSolicitudComponent },
    //{ path: 'solicitudes/:id', component: RespuestaAyudaComponent },
    { path: 'mis-solicitudes', component: MisSolicitudesComponent },
    { path: 'solicitar-tutoria', component: SolicitarTutoriaComponent },
    //{ path: 'gestionar-tutorias', component: GestionarTutoriasComponent },

    { path: '**', pathMatch: 'full', redirectTo: 'home' },
];
