import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AutenticacionService } from '../services/autenticacion.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AutenticacionService);
  const router = inject(Router);

  if (authService.userLoggedIn()) {
    return true;
  }

  router.navigate(['/login']);
  //router.navigate(['/home']);
  return false;
};
