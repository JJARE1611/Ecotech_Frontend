import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import {AuthService} from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);


  if (!authService.estaAutenticado()) {
    router.navigate(['/login']);
    return false;
  }


  if (authService.tieneRol('ROLE_ADMIN')) {
    return true;
  }


  alert('No tienes permisos para acceder a esta sección');
  router.navigate(['/']);
  return false;
};
