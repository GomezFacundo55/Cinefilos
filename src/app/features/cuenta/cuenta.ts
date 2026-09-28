import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../core/auth';

@Component({
  selector: 'app-cuenta',
  template: `
    <h1>Mi cuenta</h1>
    <p>Sesión iniciada como {{ auth.user()?.email }}</p>
    <button (click)="salir()">Salir</button>
  `,
})
export class Cuenta {
  auth = inject(Auth);
  private router = inject(Router);

  async salir() {
    await this.auth.signOut();
    this.router.navigate(['/login']);
  }
}