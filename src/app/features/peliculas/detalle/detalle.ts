import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Peliculas } from '../../../core/peliculas';
import { Funcion, Pelicula } from '../../../core/models';
import { DuracionPipe } from '../../../shared/pipes/duracion-pipe';

@Component({
  selector: 'app-detalle',
  imports: [RouterLink, DatePipe, CurrencyPipe, DuracionPipe],
  template: `
    <a routerLink="/cartelera">← Volver a la cartelera</a>

    @if (error()) { <p>{{ error() }}</p> }

    @if (pelicula(); as p) {
      <h1>{{ p.titulo }}</h1>
      <p>{{ p.duracion_min | duracion }} · {{ p.clasificacion_edad }} · {{ p.generos.join(', ') }}</p>
      <p>{{ p.sinopsis }}</p>

      <h2>Funciones</h2>
      @for (f of funciones(); track f.id) {
        <div>
          {{ f.inicio | date: "EEEE d 'de' MMMM, HH:mm" }} ·
          {{ f.formato }} · {{ f.idioma }} ·
          {{ f.precio_base | currency: 'ARS' : 'symbol-narrow' : '1.0-0' }}
        </div>
      } @empty {
        <p>No hay funciones programadas.</p>
      }
    }
  `,
})
export class Detalle implements OnInit {
  private ruta = inject(ActivatedRoute);
  private servicio = inject(Peliculas);

  pelicula = signal<Pelicula | null>(null);
  funciones = signal<Funcion[]>([]);
  error = signal('');

  async ngOnInit() {
    const id = Number(this.ruta.snapshot.paramMap.get('id'));  // lee :id de la URL
    try {
      this.pelicula.set(await this.servicio.obtener(id));
      this.funciones.set(await this.servicio.funciones(id));
    } catch (e: any) {
      this.error.set(e.message ?? 'No se pudo cargar la película');
    }
  }
}