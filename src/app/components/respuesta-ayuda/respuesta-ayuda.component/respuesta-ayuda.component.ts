import { Component, OnInit, inject } from '@angular/core';
import { Solicitud } from '../../../models/solicitud.class';
import { Respuesta } from '../../../models/respuesta.class';
import { ActivatedRoute } from '@angular/router';
import { SolicitudService } from '../../../services/solicitud-ayuda.service';
import { RespuestaAyudaService } from '../../../services/respuesta-ayuda.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MercadoPagoService } from '../../../services/mercadoPago.service';

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


  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.cargarSolicitud(id);
  }

  constructor(
    private respuestaService: RespuestaAyudaService,
    private mercadoPagoService: MercadoPagoService

  ){}

  cargarSolicitud(id: number | undefined) {
    if (id === undefined) return;
    this.solicitudService.getSolicitud(id).subscribe({
      next: (result) => {
        this.solicitud = result.data;
      }
    });
  }
 pagarRespuesta(respuesta: Respuesta) {

  if (!respuesta.id) {
    alert("La respuesta no tiene un ID válido.");
    return;
  }

  this.mercadoPagoService.crearPreferencia(respuesta.id).subscribe({

    next: (result: any) => {

      if (result.status === 1) {
        window.location.href = result.init_point;
      } else {
        alert("No se pudo generar el pago.");
      }

    },

    error: (err) => {
      console.error("Error al crear la preferencia de pago:", err);
      alert("Ocurrió un error al conectar con Mercado Pago.");
    }

  });

}

guardar() {

  // Validaciones
  if (
    !this.respuesta.respuesta ||
    this.solicitud.id === undefined ||
    !this.respuesta.precio ||
    this.respuesta.precio <= 0
  ) {
    alert("Completá la respuesta y un precio válido.");
    return;
  }

  // ID de la solicitud
  this.respuesta.id_solicitud = this.solicitud.id;

  // Obtener usuario logueado
  const usuarioClave =
    localStorage.getItem('usuario') ||
    sessionStorage.getItem('usuario') ||
    localStorage.getItem('user') ||
    sessionStorage.getItem('user');

  if (usuarioClave) {

    try {

      const usuarioLogueado = JSON.parse(usuarioClave);

      this.respuesta.id_usuario =
        usuarioLogueado.id || usuarioLogueado.id_usuario;

    } catch {

      this.respuesta.id_usuario = Number(usuarioClave);

    }

  }

  if (!this.respuesta.id_usuario) {

    alert("No se pudo identificar el usuario.");

    return;

  }

  this.respuestaService.createRespuesta(this.respuesta).subscribe({

    next: (result) => {

      alert(result.msg);

      this.respuesta = new Respuesta();

      this.cargarSolicitud(this.solicitud.id);

    },

    error: (err) => {

      console.error(err);

      alert("Error al guardar la respuesta.");

    }

  });

}