import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from './auth';

export const adminGuard: CanActivateFn = async () => {
  const auth = inject(Auth);
  const router = inject(Router);

  await auth.listo;

  if (!auth.user()) {
    return router.createUrlTree(['/login']);
  }

  try {
    return (await auth.obtenerRol()) === 'admin'
      ? true
      : router.createUrlTree(['/cartelera']);
  } catch (error: unknown) {
    console.error('No se pudo verificar el rol del usuario.', error);
    return router.createUrlTree(['/cartelera']);
  }
};