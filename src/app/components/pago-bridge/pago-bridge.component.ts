import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-pago-bridge',
  standalone: true,
  template: `
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif; background-color: #f8f9fa; color: #495057;">
      <div style="text-align: center;">
        <h3 style="margin-bottom: 10px;">Redireccionando al entorno local...</h3>
        <p style="font-size: 14px; color: #6c757d;">Por favor espera un momento.</p>
      </div>
    </div>
  `
})
export class PagoBridgeComponent implements OnInit {
  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const target = params['target'] || 'pago-exitoso';
      
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (key !== 'target') {
          queryParams.set(key, params[key]);
        }
      });

      const queryString = queryParams.toString();
      const localUrl = `http://localhost:4200/${target}${queryString ? '?' + queryString : ''}`;
      
      window.location.href = localUrl;
    });
  }
}
