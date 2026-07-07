import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-pago-pendiente',
  imports: [],
  templateUrl: './pago-pendiente.html',
  styleUrl: './pago-pendiente.css',
})
export class PagoPendiente implements OnInit {
  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const extRef = params['external_reference'];
      if (extRef || params['payment_id']) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    });
  }
}
