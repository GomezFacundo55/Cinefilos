import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../../core/auth';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-contenedor">
      <div class="auth-card auth-card-amplia">
        <h2>Crear Cuenta</h2>
        <p class="auth-subtitulo">Completá tus datos para acceder a las funciones</p>

        @if (error()) {
          <div class="mensaje-error" role="alert">
            {{ error() }}
          </div>
        }

        @if (aviso()) {
          <div class="mensaje-exito" role="status">
            {{ aviso() }}
          </div>
        }

        <form [formGroup]="form" (ngSubmit)="enviar()" class="auth-form-grilla">
          <div class="campo-grupo">
            <label for="nombre">Nombre</label>
            <input 
              id="nombre"
              type="text"
              formControlName="nombre" 
              autocomplete="given-name" 
              placeholder="Tu nombre"
            />
          </div>

          <div class="campo-grupo">
            <label for="apellido">Apellido</label>
            <input 
              id="apellido"
              type="text"
              formControlName="apellido" 
              autocomplete="family-name" 
              placeholder="Tu apellido"
            />
          </div>

          <div class="campo-grupo">
            <label for="fecha_nacimiento">Fecha de nacimiento</label>
            <input 
              id="fecha_nacimiento"
              type="date" 
              formControlName="fecha_nacimiento" 
              autocomplete="bday" 
            />
          </div>

          <div class="campo-grupo">
            <label for="tipo_sangre">Tipo de sangre</label>
            <select id="tipo_sangre" formControlName="tipo_sangre" class="select-auth">
              <option value="">Seleccionar...</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          <div class="campo-grupo">
            <label for="color_ojos">Color de ojos</label>
            <input 
              id="color_ojos"
              type="text"
              formControlName="color_ojos" 
              placeholder="Marrones, Verdes, Azules..."
            />
          </div>

          <div class="campo-grupo">
            <label for="dias_vacaciones">Días de vacaciones al año</label>
            <input 
              id="dias_vacaciones"
              type="number"
              min="0"
              formControlName="dias_vacaciones" 
              placeholder="14"
            />
          </div>

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
            <label for="password">Contraseña (mínimo 6 caracteres)</label>
            <input 
              id="password"
              type="password" 
              formControlName="password" 
              autocomplete="new-password" 
              placeholder="••••••••"
            />
          </div>

          <button type="submit" class="btn-auth btn-full" [disabled]="form.invalid || enviando()">
            {{ enviando() ? 'Creando cuenta...' : 'Crear cuenta' }}
          </button>
        </form>

        <div class="auth-footer">
          ¿Ya tenés cuenta? <a routerLink="/login">Ingresá aquí</a>
        </div>
      </div>
    </div>
  `
})
export class Registro {
  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private router = inject(Router);

  form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    fecha_nacimiento: ['', Validators.required],
    tipo_sangre: ['', Validators.required],
    color_ojos: ['', Validators.required],
    dias_vacaciones: ['14', [Validators.required, Validators.min(0)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  error = signal('');
  aviso = signal('');
  enviando = signal(false);

  async enviar() {
    if (this.form.invalid) return;

    this.enviando.set(true);
    this.error.set('');
    this.aviso.set('');

    try {
      const v = this.form.getRawValue();

      const res = await this.auth.signUp(v.email, v.password, {
        nombre: v.nombre,
        apellido: v.apellido,
        fecha_nacimiento: v.fecha_nacimiento,
        tipo_sangre: v.tipo_sangre,
        color_ojos: v.color_ojos,
        dias_vacaciones: String(v.dias_vacaciones)
      });

      if (res && (res as any).error) throw (res as any).error;

      this.aviso.set('Cuenta creada con éxito. Redirigiendo...');
      setTimeout(() => this.router.navigate(['/cuenta']), 1500);
    } catch (e: any) {
      const msg = e?.message || '';

      if (msg.includes('already registered') || msg.includes('already in use')) {
        this.error.set('Este correo electrónico ya está registrado.');
      } else if (msg.includes('at least 6 characters')) {
        this.error.set('La contraseña debe tener al menos 6 caracteres.');
      } else {
        this.error.set(msg || 'No se pudo crear la cuenta. Intentalo de nuevo.');
      }
    } finally {
      this.enviando.set(false);
    }
  }
}