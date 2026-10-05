import { Service, inject, signal, computed } from '@angular/core';
import { Session } from '@supabase/supabase-js';
import { SupabaseService } from './supabase';

export interface DatosRegistro {
  nombre: string;
  apellido: string;
  fecha_nacimiento: string;
  tipo_sangre: string;
  color_ojos: string;
  dias_vacaciones: string;
}

@Service()
export class Auth {
  private supabase = inject(SupabaseService).client;

  readonly session = signal<Session | null>(null);
  readonly user = computed(() => this.session()?.user ?? null);
  readonly listo: Promise<void>;

  async obtenerRol(): Promise<'cliente' | 'admin' | 'empleado' | null> {
  const usuario = this.user();
  if (!usuario) return null;

  const { data, error } = await this.supabase
    .from('perfiles')
    .select('rol')
    .eq('id', usuario.id)
    .maybeSingle();

  if (error) throw error;

  const rol = data?.rol;
  return rol === 'cliente' || rol === 'admin' || rol === 'empleado'
    ? rol
    : null;
  }

  constructor() {
    this.listo = this.supabase.auth.getSession().then(({ data }) => {
      this.session.set(data.session);
    });
    this.supabase.auth.onAuthStateChange((_evento, session) => {
      this.session.set(session);
    });
  }

  signIn(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  signUp(email: string, password: string, datos: DatosRegistro) {
    // "data" viaja a Supabase; el trigger crear_perfil lo usa para llenar "perfiles"
    return this.supabase.auth.signUp({ email, password, options: { data: datos } });
  }

  signOut() {
    return this.supabase.auth.signOut();
  }

  getUser() {
    return this.supabase.auth.getUser();
  }
}