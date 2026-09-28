import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Peliculas } from '../../../core/peliculas';
import { Pelicula } from '../../../core/models';
import { PeliculaCard } from '../../../shared/pelicula-card/pelicula-card';

@Component({
  selector: 'app-cartelera',
  imports: [PeliculaCard],
  template: `
    <h1>Cartelera</h1>
    <input type="search" placeholder="Buscar película" (input)="buscar($event)" />

    @if (cargando()) { <p>Cargando...</p> }
    @if (error()) { <p>{{ error() }}</p> }

    <section>
      @for (p of filtradas(); track p.id) {
        <app-pelicula-card [pelicula]="p" (ver)="abrir($event)" />
      } @empty {
        @if (!cargando()) { <p>No hay películas para mostrar.</p> }
      }
    </section>
  `,
})
export class Cartelera implements OnInit {
  private servicio = inject(Peliculas);
  private router = inject(Router);

  peliculas = signal<Pelicula[]>([]);
  busqueda = signal('');
  cargando = signal(true);
  error = signal('');

  // Se recalcula sola cuando cambia la lista o el texto buscado
  filtradas = computed(() => {
    const texto = this.busqueda().toLowerCase();
    return this.peliculas().filter((p) => p.titulo.toLowerCase().includes(texto));
  });

  async ngOnInit() {
    try {
      this.peliculas.set(await this.servicio.listar());
    } catch (e: any) {
      this.error.set(e.message ?? 'No se pudo cargar la cartelera');
    } finally {
      this.cargando.set(false);
    }
  }

  buscar(evento: Event) {
    this.busqueda.set((evento.target as HTMLInputElement).value);
  }

  abrir(id: number) {
    this.router.navigate(['/pelicula', id]);
  }
}