import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AutenticacionService } from '../services/autenticacion.service';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  // Usamos inject() para obtener el servicio dentro de la función
  const authService = inject(AutenticacionService);
  const token = authService.getToken();

  // Clonamos la petición solo si existe un token
  if (token) {
    const tokenizeReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(tokenizeReq);
  }
  return next(req);
};
