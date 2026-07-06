import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AutenticacionService } from '../services/autenticacion.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AutenticacionService);
  const router = inject(Router);

  if (authService.userLoggedIn() && authService.isAdmin()) {
    return true;
  }

  // Si no es admin, redirigir a inicio
  router.navigate(['/home']);
  return false;
};
