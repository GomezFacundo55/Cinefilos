import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Pelicula } from '../../core/models';
import { DuracionPipe } from '../pipes/duracion-pipe';
import { ResaltarDirective } from '../directives/resaltar';

@Component({
  selector: 'app-pelicula-card',
  imports: [DuracionPipe, ResaltarDirective],
  template: `
    <article appResaltar (click)="ver.emit(pelicula.id)">
      @if (pelicula.poster_url) {
        <img [src]="pelicula.poster_url" [alt]="pelicula.titulo" />
      }
      <h3>{{ pelicula.titulo }}</h3>
      <p>{{ pelicula.duracion_min | duracion }} · {{ pelicula.clasificacion_edad }}</p>
      <p>{{ pelicula.generos.join(', ') }}</p>
    </article>
  `,
})
export class PeliculaCard {
  @Input({ required: true }) pelicula!: Pelicula;   // datos que entran
  @Output() ver = new EventEmitter<number>();        // evento que sale
}