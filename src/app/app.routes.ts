import { Routes } from '@angular/router';
import { authGuard } from './core/auth-guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/auth/login/login').then(m => m.Login) },
  { path: 'registro', loadComponent: () => import('./features/auth/registro/registro').then(m => m.Registro) },
  { path: 'cuenta', canActivate: [authGuard], loadComponent: () => import('./features/cuenta/cuenta').then(m => m.Cuenta) },
  { path: 'cartelera', loadComponent: () => import('./features/peliculas/cartelera/cartelera').then(m => m.Cartelera) },
  { path: 'pelicula/:id', loadComponent: () => import('./features/peliculas/detalle/detalle').then(m => m.Detalle) },
  { path: '', pathMatch: 'full', redirectTo: 'cartelera' },
];