import { Service, inject } from '@angular/core';
import { SupabaseService } from './supabase';
import { Funcion, Pelicula } from './models';

@Service()
export class Peliculas {
  private supabase = inject(SupabaseService).client;

  async listar(): Promise<Pelicula[]> {
    const { data, error } = await this.supabase
      .from('peliculas')
      .select('*, pelicula_generos(generos(nombre))')
      .eq('publicada', true)
      .order('titulo');
    if (error) throw error;
    return (data as any[]).map((p) => this.armar(p));
  }

  async obtener(id: number): Promise<Pelicula> {
    const { data, error } = await this.supabase
      .from('peliculas')
      .select('*, pelicula_generos(generos(nombre))')
      .eq('id', id)
      .single();
    if (error) throw error;
    return this.armar(data);
  }

  async funciones(peliculaId: number): Promise<Funcion[]> {
    const { data, error } = await this.supabase
      .from('funciones')
      .select('*')
      .eq('pelicula_id', peliculaId)
      .eq('estado', 'programada')
      .gt('inicio', new Date().toISOString())
      .order('inicio');
    if (error) throw error;
    return data as Funcion[];
  }

  // Convierte la respuesta anidada de Supabase en un objeto simple con generos: string[]
  private armar(p: any): Pelicula {
    const { pelicula_generos, ...resto } = p;
    return { ...resto, generos: pelicula_generos.map((x: any) => x.generos.nombre) };
  }
}