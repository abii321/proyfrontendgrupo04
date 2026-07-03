import { Component, OnInit, inject } from '@angular/core';
import { Solicitud } from '../../../models/solicitud.class';
import { Respuesta } from '../../../models/respuesta.class';
import { ActivatedRoute } from '@angular/router';
import { SolicitudService } from '../../../services/solicitud-ayuda.service';
import { RespuestaAyudaService } from '../../../services/respuesta-ayuda.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-respuesta-ayuda.component',
  imports: [CommonModule, FormsModule],
  templateUrl: './respuesta-ayuda.component.html',
  styleUrl: './respuesta-ayuda.component.css',
  standalone: true
})
export class RespuestaAyudaComponent implements OnInit {

  solicitud!: Solicitud;
  respuesta = new Respuesta();

  private route = inject(ActivatedRoute);
  private solicitudService = inject(SolicitudService);
  private respuestaService = inject(RespuestaAyudaService);

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.cargarSolicitud(id);
  }

  cargarSolicitud(id: number | undefined) {
    if (id === undefined) return;
    this.solicitudService.getSolicitud(id).subscribe({
      next: (result) => {
        this.solicitud = result.data;
      }
    });
  }

  guardar() {
    // 1. Validaciones básicas antes de enviar
    if (!this.respuesta.respuesta || this.solicitud.id === undefined) return;
    
    // 2. Asignamos el ID de la solicitud actual
    this.respuesta.id_solicitud = this.solicitud.id;

    // 3. BUSCAMOS EL ID DEL USUARIO EN EL NAVEGADOR
    // Intentamos buscarlo en las claves más comunes de localStorage y sessionStorage
    const usuarioClave = localStorage.getItem('usuario') || 
                         sessionStorage.getItem('usuario') || 
                         localStorage.getItem('user') || 
                         sessionStorage.getItem('user');

    if (usuarioClave) {
      try {
        const usuarioLogueado = JSON.parse(usuarioClave);
        // Extraemos el id (manejando si tu backend lo guardó como 'id' o 'id_usuario')
        this.respuesta.id_usuario = usuarioLogueado.id || usuarioLogueado.id_usuario;
      } catch (e) {
        // Si no era un JSON y guardaste el ID como texto plano directamente:
        this.respuesta.id_usuario = Number(usuarioClave);
      }
    }

    // 4. Si después de buscar por todos lados sigue vacío, te avisamos por la consola para debuguear
    if (!this.respuesta.id_usuario) {
      console.error("⚠️ Error: No se pudo recuperar el ID del usuario desde el almacenamiento del navegador.");
      alert("No se pudo identificar tu sesión de usuario. Por favor, vuelve a iniciar sesión.");
      return;
    }

    // 5. Enviamos al Backend con todos los campos requeridos cargados
    this.respuestaService.createRespuesta(this.respuesta).subscribe({
      next: (result) => {
        alert('Respuesta enviada con éxito.');
        this.respuesta = new Respuesta(); // Limpiamos el formulario
        this.cargarSolicitud(this.solicitud.id); // Recargamos la info
      },
      error: (err) => {
        console.error("Error al guardar en el servidor:", err);
      }
    });
  }
}