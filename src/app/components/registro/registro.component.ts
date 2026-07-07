import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, AfterViewInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { AutenticacionService } from '../../services/autenticacion.service';
import { Usuario } from '../../models/usuario.class';
import { GoogleAuthService } from '../../services/google-auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-registro',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css',
})

export class RegistroComponent implements AfterViewInit {
  usuario: Usuario;
  banGoogle: boolean = false;
  googleToken: string = '';
  msg: string = "";
  cargandoUbicacion: boolean = false;
  sugerencias: any[] = [];
  mostrarSugerencias: boolean = false;
  private searchDebounceTimer: any;

  constructor(private autenticacionService: AutenticacionService, private googleAuthService: GoogleAuthService, private router: Router, private cdr: ChangeDetectorRef) {
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
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(this.usuario.ubicacion)}&format=json&limit=1&countrycodes=ar`);
      const data = await response.json();
      if (data && data.length > 0) {
        this.usuario.lat = parseFloat(data[0].lat);
        this.usuario.lng = parseFloat(data[0].lon);
      } else {
        const responseFallback = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(this.usuario.ubicacion)}&format=json&limit=1`);
        const dataFallback = await responseFallback.json();
        if (dataFallback && dataFallback.length > 0) {
          this.usuario.lat = parseFloat(dataFallback[0].lat);
          this.usuario.lng = parseFloat(dataFallback[0].lon);
        }
      }
    } catch (e) {
      console.error('Error al geocodificar ubicación:', e);
    }
  }

  detectarUbicacionGPS() {
    if (navigator.geolocation) {
      this.cargandoUbicacion = true;
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
          this.cargandoUbicacion = false;
          this.cdr.detectChanges();
        },
        async (error) => {
          console.warn('[Geolocalización] La geolocalización nativa falló o expiró el tiempo de espera:', error);
          await this.ejecutarCadenaGeolocalizacionIP();
        },
        { enableHighAccuracy: false, timeout: 16000, maximumAge: 60000 }
      );
    } else {
      console.warn('[Geolocalización] El navegador no soporta geolocalización nativa.');
      this.ejecutarCadenaGeolocalizacionIP();
    }
  }

  async ejecutarCadenaGeolocalizacionIP(): Promise<void> {
    this.cargandoUbicacion = true;
    this.cdr.detectChanges();

    // 1. IPWHO.IS (Primaria CORS-friendly)
    try {
      const res = await fetch('https://ipwho.is/');
      const data = await res.json();
      if (data && data.success && data.latitude && data.longitude) {
        this.usuario.lat = data.latitude;
        this.usuario.lng = data.longitude;
        const region = data.region ? `, ${data.region}` : '';
        this.usuario.ubicacion = `${data.city || ''}${region}`;
        this.cargandoUbicacion = false;
        this.cdr.detectChanges();
        return;
      } else {
        throw new Error(data.message || 'Respuesta fallida de ipwho.is');
      }
    } catch (e) {
      console.warn('[Geolocalización] El servicio primario IP (ipwho.is) falló:', e);
    }

    // 2. GEOLOCATION-DB (Secundaria CORS-friendly)
    try {
      const res = await fetch('https://geolocation-db.com/json/');
      const data = await res.json();
      if (data && data.latitude && data.longitude) {
        this.usuario.lat = data.latitude;
        this.usuario.lng = data.longitude;
        const state = data.state ? `, ${data.state}` : '';
        this.usuario.ubicacion = `${data.city || ''}${state}`;
        this.cargandoUbicacion = false;
        this.cdr.detectChanges();
        return;
      } else {
        throw new Error('Coordenadas no encontradas en la respuesta de geolocation-db.com');
      }
    } catch (e) {
      console.warn('[Geolocalización] El servicio secundario IP (geolocation-db.com) falló:', e);
    }

    // 3. FREEIPAPI.COM (Terciaria)
    try {
      const res = await fetch('https://freeipapi.com/api/json');
      const data = await res.json();
      if (data && data.latitude && data.longitude) {
        this.usuario.lat = data.latitude;
        this.usuario.lng = data.longitude;
        const region = data.regionName ? `, ${data.regionName}` : '';
        this.usuario.ubicacion = `${data.cityName || ''}${region}`;
        this.cargandoUbicacion = false;
        this.cdr.detectChanges();
        return;
      } else {
        throw new Error('Coordenadas no encontradas en la respuesta de freeipapi');
      }
    } catch (e) {
      console.warn('[Geolocalización] El servicio terciario IP (freeipapi.com) falló:', e);
    }

    // 4. IPAPI.CO (Cuaternaria)
    try {
      const res = await fetch('https://ipapi.co/json/');
      const data = await res.json();
      if (data && data.latitude && data.longitude) {
        this.usuario.lat = data.latitude;
        this.usuario.lng = data.longitude;
        const region = data.region ? `, ${data.region}` : '';
        this.usuario.ubicacion = `${data.city || ''}${region}`;
        this.cargandoUbicacion = false;
        this.cdr.detectChanges();
        return;
      } else {
        throw new Error('Coordenadas no encontradas en la respuesta de ipapi.co');
      }
    } catch (e) {
      console.error('[Geolocalización] El servicio cuaternario IP (ipapi.co) falló:', e);
    }

    alert('No se pudo determinar tu ubicación de forma automática. Por favor, ingrésala manualmente.');
    this.cargandoUbicacion = false;
    this.cdr.detectChanges();
  }

  onUbicacionInput() {
    this.usuario.lat = null;
    this.usuario.lng = null;
    this.sugerencias = [];

    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }

    const query = this.usuario.ubicacion;
    if (!query || query.trim().length < 3) {
      this.mostrarSugerencias = false;
      return;
    }

    this.searchDebounceTimer = setTimeout(async () => {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=ar`);
        const data = await response.json();
        if (data && data.length > 0) {
          this.sugerencias = data.map((item: any) => ({
            display_name: item.display_name,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon)
          }));
          this.mostrarSugerencias = true;
        } else {
          this.sugerencias = [];
          this.mostrarSugerencias = false;
        }
      } catch (error) {
        console.error('Error fetching autocomplete suggestions:', error);
      }
      this.cdr.detectChanges();
    }, 400);
  }

  seleccionarSugerencia(sug: any) {
    this.usuario.ubicacion = sug.display_name;
    this.usuario.lat = sug.lat;
    this.usuario.lng = sug.lng;
    this.sugerencias = [];
    this.mostrarSugerencias = false;
    this.cdr.detectChanges();
  }

  onBlurUbicacion() {
    setTimeout(() => {
      this.mostrarSugerencias = false;
      this.cdr.detectChanges();
    }, 200);
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
        this.router.navigate(['/login']);
      },
      (error: any) => {
        console.error("Error al registrar con Google:", error);
      }
    );
  }

  async registrarUsuarioLocal(form: NgForm) {
    if (!this.usuario.lat || !this.usuario.lng) {
      await this.geocodificarUbicacion();
    }

    this.autenticacionService.postRegistroLocal(this.usuario).subscribe(
      (result: any) => {
        form.reset();
        this.msg = ""
        this.router.navigate(['/login']);
        this.cdr.detectChanges();
      },
      (error: any) => {
        this.msg = "Error al registrar, este email ya pertenece a un usuario"
        this.cdr.detectChanges();
      }
    )
  }

}