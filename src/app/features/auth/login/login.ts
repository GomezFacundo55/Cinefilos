import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../../core/auth';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <h1>Ingresar</h1>
    <form [formGroup]="form" (ngSubmit)="enviar()">
      <input type="email" formControlName="email" placeholder="Email" />
      <input type="password" formControlName="password" placeholder="Contraseña" />
      @if (error()) { <p>{{ error() }}</p> }
      <button type="submit" [disabled]="form.invalid || enviando()">Ingresar</button>
    </form>
    <a routerLink="/registro">Crear cuenta</a>
  `,
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
    this.enviando.set(true);
    this.error.set('');
    try {
      const { email, password } = this.form.getRawValue();
      const { error } = await this.auth.signIn(email, password);
      if (error) throw error;
      this.router.navigate(['/cuenta']);
    } catch (e: any) {
      this.error.set(e.message ?? 'No se pudo ingresar');
    } finally {
      this.enviando.set(false);
    }
  }
}