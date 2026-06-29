import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { RegistroComponent } from './components/registro/registro.component';
import { LoginComponent } from './components/login/login.component';
import { SolicitudAyudaComponent } from './components/solicitud-ayuda/solicitud-ayuda.component/solicitud-ayuda.component';
import { RespuestaAyudaComponent } from './components/respuesta-ayuda/respuesta-ayuda.component/respuesta-ayuda.component';

export const routes: Routes = [
    { path: 'home', component: HomeComponent },
    { path: 'registro', component: RegistroComponent },
    { path: 'login', component: LoginComponent },
    { path: 'solicitud-ayuda', component: SolicitudAyudaComponent },
    { path: 'solicitudes/:id', component: RespuestaAyudaComponent },
    { path: '**', pathMatch: 'full', redirectTo: 'home' },
    
];
