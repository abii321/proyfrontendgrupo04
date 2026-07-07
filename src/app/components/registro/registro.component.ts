import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, AfterViewInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { AutenticacionService } from '../../services/autenticacion.service';
import { Usuario } from '../../models/usuario.class';
import { GoogleAuthService } from '../../services/google-auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-registro',
  imports: [CommonModule, FormsModule, RouterLink ],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css',
})

export class RegistroComponent implements AfterViewInit {
  usuario: Usuario;
  banGoogle: boolean = false;
  googleToken: string = '';
  msg: string = "";

  constructor( private autenticacionService: AutenticacionService, private googleAuthService: GoogleAuthService, private router: Router, private cdr: ChangeDetectorRef ) {
    this.usuario = new Usuario();
    this.usuario.rol = ''; 
  }

  ngAfterViewInit(): void {
    this.cargarBotonGoogle();
  }

  cargarBotonGoogle() {
    // función intermedia que guarda el token temporalmente
    this.googleAuthService.inicializar(this.handleGoogleResponse.bind(this));

    this.googleAuthService.renderButton("googleBtnContainer", "signup_with"); // en html
  }

  handleGoogleResponse(response: any) {
    console.log("¡Google respondió con éxito!");
    this.googleToken = response.credential; 
    this.banGoogle = true; // para mostrar el resto del formulario
    this.cdr.detectChanges(); 
  }

  cancelarGoogle() {
    this.banGoogle = false;
    this.googleToken = '';
    setTimeout(() => this.cargarBotonGoogle(), 50);
  }
  
  async geocodificarUbicacion(): Promise<void> {
    if (!this.usuario.ubicacion) return;
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(this.usuario.ubicacion)}&format=json&limit=1`);
      const data = await response.json();
      if (data && data.length > 0) {
        this.usuario.lat = parseFloat(data[0].lat);
        this.usuario.lng = parseFloat(data[0].lon);
      }
    } catch (e) {
      console.error('Error al geocodificar ubicación:', e);
    }
  }

  detectarUbicacionGPS() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          this.usuario.lat = lat;
          this.usuario.lng = lng;

          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
            const data = await response.json();
            if (data && data.address) {
              const address = data.address;
              const ciudad = address.city || address.town || address.village || address.suburb || data.display_name;
              this.usuario.ubicacion = ciudad;
            } else {
              this.usuario.ubicacion = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            }
          } catch (e) {
            this.usuario.ubicacion = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          }
          this.cdr.detectChanges();
        },
        (error) => {
          console.error('Error al obtener geolocalización:', error);
          alert('No se pudo obtener tu ubicación actual. Por favor escríbela manualmente.');
        }
      );
    } else {
      alert('Tu navegador no soporta geolocalización.');
    }
  }

  async registrarUsuarioGoogle() {
    if (!this.usuario.lat || !this.usuario.lng) {
      await this.geocodificarUbicacion();
    }

    const body = {
      token: this.googleToken, 
      rol: this.usuario.rol,
      ubicacion: this.usuario.ubicacion,
      lat: this.usuario.lat,
      lng: this.usuario.lng,
      universidad: this.usuario.universidad,
      carrera: this.usuario.carrera,
      genero: this.usuario.genero,
    };

    this.autenticacionService.postSignUpGoogle(body).subscribe(
      (result: any) => {
        console.log(result);
        this.router.navigate(['/home']);
      },
      (error : any) => {
        console.error("Error al registrar con Google:", error);
      }
    );
  }

  async registrarUsuarioLocal(form: NgForm){
    if (!this.usuario.lat || !this.usuario.lng) {
      await this.geocodificarUbicacion();
    }

    this.autenticacionService.postRegistroLocal(this.usuario).subscribe(
      ( result : any) => {
        form.reset();
        this.msg = ""
        this.cdr.detectChanges();
      },
      ( error : any ) => {
        this.msg = "Error al registrar, este email ya pertenece a un usuario"
        this.cdr.detectChanges();
      }
    )
  }

}