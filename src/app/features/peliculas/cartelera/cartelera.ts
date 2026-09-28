import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Peliculas } from '../../../core/peliculas';
import { Pelicula } from '../../../core/models';
import { PeliculaCard } from '../../../shared/pelicula-card/pelicula-card';

@Component({
  selector: 'app-cartelera',
  imports: [PeliculaCard],
  templateUrl: './cartelera.html',
  styleUrl: './cartelera.scss',
})
export class Cartelera implements OnInit {
  private servicio = inject(Peliculas);
  private router = inject(Router);

  peliculas = signal<Pelicula[]>([]);
  busqueda = signal('');
  generoSeleccionado = signal('Todos');
  cargando = signal(true);
  error = signal('');

  generos = computed(() => [
    'Todos',
    ...new Set(this.peliculas().flatMap((pelicula) => pelicula.generos)).values(),
  ]);

  filtradas = computed(() => {
    const texto = this.busqueda().trim().toLocaleLowerCase();
    const genero = this.generoSeleccionado();

    return this.peliculas().filter((pelicula) => {
      const coincideTexto =
        !texto ||
        pelicula.titulo.toLocaleLowerCase().includes(texto) ||
        pelicula.generos.some((nombre) => nombre.toLocaleLowerCase().includes(texto));
      const coincideGenero = genero === 'Todos' || pelicula.generos.includes(genero);

      return coincideTexto && coincideGenero;
    });
  });

  async ngOnInit() {
    await this.cargar();
  }

  async cargar() {
    this.cargando.set(true);
    this.error.set('');

    try {
      this.peliculas.set(await this.servicio.listar());
    } catch (error: unknown) {
      this.error.set(
        error instanceof Error ? error.message : 'No se pudo cargar la cartelera.',
      );
    } finally {
      this.cargando.set(false);
    }
  }

  buscar(evento: Event) {
    this.busqueda.set((evento.target as HTMLInputElement).value);
  }

  seleccionarGenero(genero: string) {
    this.generoSeleccionado.set(genero);
  }

  abrir(id: number) {
    this.router.navigate(['/pelicula', id]);
  }
}