import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Pelicula } from '../../core/models';
import { DuracionPipe } from '../pipes/duracion-pipe';
import { ResaltarDirective } from '../directives/resaltar';

@Component({
  selector: 'app-pelicula-card',
  imports: [DuracionPipe, ResaltarDirective],
  template: `
    <article class="ticket" appResaltar>
      <div class="ticket-poster">
        @if (pelicula.poster_url) {
          <img [src]="pelicula.poster_url" [alt]="'Póster de ' + pelicula.titulo" />
        } @else {
          <div class="poster-sin-imagen" aria-hidden="true">
            <span>CINÉFILOS</span>
            <strong>{{ pelicula.titulo }}</strong>
          </div>
        }
        <span class="ticket-sello">CINE<br />FÍLO</span>
      </div>

      <div class="ticket-contenido">
        <div class="ticket-titulo-fila">
          <div>
            <p class="ticket-etiqueta">EN CARTELERA</p>
            <h2>{{ pelicula.titulo }}</h2>
          </div>
          @if (pelicula.clasificacion_edad) {
            <span class="ticket-edad">{{ pelicula.clasificacion_edad }}</span>
          }
        </div>

        @if (pelicula.sinopsis) {
          <p class="ticket-sinopsis">{{ pelicula.sinopsis }}</p>
        }

        <div class="ticket-generos" aria-label="Géneros">
          @for (genero of pelicula.generos.slice(0, 2); track genero) {
            <span>{{ genero }}</span>
          }
          @if (pelicula.generos.length > 2) {
            <span>+{{ pelicula.generos.length - 2 }}</span>
          }
        </div>
      </div>

      <div class="ticket-talón">
        <div class="ticket-duracion">
          <span>Duración</span>
          <strong>{{ pelicula.duracion_min | duracion }}</strong>
        </div>
        <span class="ticket-numero" aria-hidden="true">#{{ pelicula.id.toString().padStart(3, '0') }}</span>
        <button
          class="ticket-boton"
          type="button"
          [attr.aria-label]="'Ver funciones de ' + pelicula.titulo"
          (click)="ver.emit(pelicula.id)"
        >
          Ver funciones <span aria-hidden="true">→</span>
        </button>
      </div>
    </article>
  `,
  styleUrl: './pelicula-card.scss',
})
export class PeliculaCard {
  @Input({ required: true }) pelicula!: Pelicula;   // datos que entran
  @Output() ver = new EventEmitter<number>();        // evento que sale
}