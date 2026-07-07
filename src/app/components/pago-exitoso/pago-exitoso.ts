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

      const extRef = params['external_reference'];
      this.paymentId = params['paymentId'];
      this.status = params['status'];

      if (extRef && extRef.endsWith(':dev')) {
        const cleanRef = extRef.replace(':dev', '');
        const localUrl = `http://localhost:4200/pago-exitoso?external_reference=${cleanRef}&payment_id=${this.paymentId || ''}&status=${this.status || ''}`;
        window.location.href = localUrl;
        return;
      }

      this.externalReference = extRef;

      if (this.paymentId || this.status || this.externalReference) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      console.log(params);

    });

  }

}