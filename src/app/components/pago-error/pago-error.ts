import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-pago-error',
  imports: [],
  templateUrl: './pago-error.html',
  styleUrl: './pago-error.css',
})
export class PagoError implements OnInit {
  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const extRef = params['external_reference'];
      if (extRef && extRef.endsWith(':dev')) {
        const cleanRef = extRef.replace(':dev', '');
        const localUrl = `http://localhost:4200/pago-error?external_reference=${cleanRef}`;
        window.location.href = localUrl;
        return;
      }
      if (extRef || params['payment_id']) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    });
  }
}
