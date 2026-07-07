import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-pago-exitoso',
  imports: [RouterLink],
  templateUrl: './pago-exitoso.html',
  styleUrl: './pago-exitoso.css',
})
export class PagoExitoso implements OnInit {

    paymentId: string | null = null;
  status: string | null = null;
  externalReference: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {

      this.paymentId = params['paymentId'];
      this.status = params['status'];
      this.externalReference = params['external_reference'];

      if (this.paymentId || this.status || this.externalReference) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }

    });

  }

}