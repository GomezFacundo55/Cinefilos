import { Component, effect, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Auth } from './core/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  auth = inject(Auth);
  esAdmin = signal(false);

  constructor() {
    effect((onCleanup) => {
      const userId = this.auth.user()?.id;
      this.esAdmin.set(false);
      if (!userId) return;

      let vigente = true;
      void this.auth
        .obtenerRol()
        .then((rol) => {
          if (vigente) this.esAdmin.set(rol === 'admin');
        })
        .catch((error: unknown) => {
          if (vigente) console.error('No se pudo consultar el rol para la navegación.', error);
        });

      onCleanup(() => {
        vigente = false;
      });
    });
  }
}