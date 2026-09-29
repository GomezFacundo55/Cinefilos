import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Funcion, Pelicula } from '../../../core/models';
import { Peliculas } from '../../../core/peliculas';
import { DuracionPipe } from '../../../shared/pipes/duracion-pipe';

@Component({
  selector: 'app-detalle',
  imports: [RouterLink, DatePipe, CurrencyPipe, DuracionPipe],
  templateUrl: './detalle.html',
  styleUrl: './detalle.scss',
})
export class Detalle implements OnInit {
  private ruta = inject(ActivatedRoute);
  private servicio = inject(Peliculas);
  private destroyRef = inject(DestroyRef);
  private solicitudActual = 0;

  pelicula = signal<Pelicula | null>(null);
  funciones = signal<Funcion[]>([]);
  peliculaId = signal<number | null>(null);
  cargando = signal(true);
  error = signal('');

  ngOnInit() {
    this.ruta.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((parametros) => {
      void this.cargar(Number(parametros.get('id')));
    });
  }

  async cargar(id = this.peliculaId()) {
    const solicitud = ++this.solicitudActual;
    this.pelicula.set(null);
    this.funciones.set([]);
    this.error.set('');
    this.cargando.set(true);

    if (id === null || !Number.isSafeInteger(id) || id < 1) {
      this.error.set('El identificador de la película no es válido.');
      this.cargando.set(false);
      this.peliculaId.set(null);
      return;
    }

    this.peliculaId.set(id);

    try {
      const [pelicula, funciones] = await Promise.all([
        this.servicio.obtener(id),
        this.servicio.funciones(id),
      ]);

      if (solicitud !== this.solicitudActual) return;
      this.pelicula.set(pelicula);
      this.funciones.set(funciones);
    } catch (error: unknown) {
      if (solicitud !== this.solicitudActual) return;
      console.error('No se pudo cargar el detalle y las funciones de la película.', error);
      this.error.set('No pudimos cargar la película y sus funciones. Revisá tu conexión e intentá de nuevo.');
    } finally {
      if (solicitud === this.solicitudActual) this.cargando.set(false);
    }
  }
}
