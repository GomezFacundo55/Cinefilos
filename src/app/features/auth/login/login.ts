import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../../core/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-contenedor">
      <div class="auth-card">
        <h2>Ingresar</h2>
        <p class="auth-subtitulo">Accede a tus entradas y beneficios cinéfilos</p>

        @if (error()) {
          <div class="mensaje-error" role="alert">
            {{ error() }}
          </div>
        }

        <form [formGroup]="form" (ngSubmit)="enviar()" class="auth-form">
          <div class="campo-grupo">
            <label for="email">Correo electrónico</label>
            <input 
              id="email" 
              type="email" 
              formControlName="email" 
              autocomplete="email" 
              inputmode="email"
              placeholder="tu@email.com"
            />
          </div>

          <div class="campo-grupo">
            <label for="password">Contraseña</label>
            <input 
              id="password" 
              type="password" 
              formControlName="password" 
              autocomplete="current-password"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" class="btn-auth" [disabled]="form.invalid || enviando()">
            {{ enviando() ? 'Ingresando...' : 'Ingresar' }}
          </button>
        </form>

        <div class="auth-footer">
          ¿No tienes cuenta? <a routerLink="/registro">Crear cuenta</a>
        </div>
      </div>
    </div>
  `
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private router = inject(Router);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  error = signal('');
  enviando = signal(false);

  async enviar() {
    if (this.form.invalid) return;

    this.enviando.set(true);
    this.error.set('');

    try {
      const { email, password } = this.form.getRawValue();
      const { error } = await this.auth.signIn(email, password);
      
      if (error) throw error;

      this.router.navigate(['/cuenta']);
    } catch (e: any) {
      // Traducir los errores típicos de Supabase Auth
      const msg = e?.message || '';

      if (msg.includes('Invalid login credentials')) {
        this.error.set('Correo o contraseña incorrectos.');
      } else if (msg.includes('Email not confirmed')) {
        this.error.set('Por favor confirma tu correo electrónico antes de ingresar.');
      } else {
        this.error.set(msg || 'No se pudo ingresar. Inténtalo de nuevo.');
      }
    } finally {
      this.enviando.set(false);
    }
  }
}