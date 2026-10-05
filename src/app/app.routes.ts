import { Routes } from '@angular/router';
import { authGuard } from './core/auth-guard';
import { adminGuard } from './core/admin-guard';


export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/auth/login/login').then(m => m.Login) },
  { path: 'registro', loadComponent: () => import('./features/auth/registro/registro').then(m => m.Registro) },
  { path: 'cuenta', canActivate: [authGuard], loadComponent: () => import('./features/cuenta/cuenta').then(m => m.Cuenta) },
  { path: 'cartelera', loadComponent: () => import('./features/peliculas/cartelera/cartelera').then(m => m.Cartelera) },
  { path: 'pelicula/:id', loadComponent: () => import('./features/peliculas/detalle/detalle').then(m => m.Detalle) },
  { path: 'funcion/:id/butacas', loadComponent: () => import('./features/compra/butacas/butacas').then(m => m.SeleccionButacas) },
  { path: '', pathMatch: 'full', redirectTo: 'cartelera' },
  {path: 'admin',canActivate: [adminGuard],loadComponent: () => import('./features/auth/admin/admin').then(m => m.Admin),},
];