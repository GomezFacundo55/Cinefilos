import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../../core/auth';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <h1>Crear cuenta</h1>
    <form [formGroup]="form" (ngSubmit)="enviar()">
      <input formControlName="nombre" placeholder="Nombre" />
      <input formControlName="apellido" placeholder="Apellido" />
      <input type="date" formControlName="fecha_nacimiento" />
      <input formControlName="tipo_sangre" placeholder="Tipo de sangre" />
      <input formControlName="color_ojos" placeholder="Color de ojos" />
      <input type="number" formControlName="dias_vacaciones" placeholder="Días de vacaciones" />
      <input type="email" formControlName="email" placeholder="Email" />
      <input type="password" formControlName="password" placeholder="Contraseña (mín. 6)" />
      @if (error()) { <p>{{ error() }}</p> }
      @if (aviso()) { <p>{{ aviso() }}</p> }
      <button type="submit" [disabled]="form.invalid || enviando()">Registrarme</button>
    </form>
    <a routerLink="/login">Ya tengo cuenta</a>
  `,
})
export class Registro {
  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private router = inject(Router);

  form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    fecha_nacimiento: ['', Validators.required],
    tipo_sangre: [''],
    color_ojos: [''],
    dias_vacaciones: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });
  error = signal('');
  aviso = signal('');
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