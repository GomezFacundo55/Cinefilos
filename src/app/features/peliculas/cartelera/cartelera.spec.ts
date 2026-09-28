import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Pelicula } from '../../../core/models';
import { Peliculas } from '../../../core/peliculas';
import { Cartelera } from './cartelera';

describe('Cartelera', () => {
  let component: Cartelera;
  let fixture: ComponentFixture<Cartelera>;
  const catalogo: Pelicula[] = [
    {
      id: 1,
      titulo: 'La última función',
      sinopsis: null,
      duracion_min: 110,
      poster_url: null,
      clasificacion_edad: '13+',
      estreno: null,
      generos: ['Drama', 'Suspenso'],
    },
    {
      id: 2,
      titulo: 'Aventura en Marte',
      sinopsis: null,
      duracion_min: 95,
      poster_url: null,
      clasificacion_edad: 'ATP',
      estreno: null,
      generos: ['Aventura', 'Ciencia ficción'],
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cartelera],
      providers: [
        { provide: Peliculas, useValue: { listar: () => Promise.resolve(catalogo) } },
        { provide: Router, useValue: { navigate: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Cartelera);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('filters by title and genre text without case sensitivity', () => {
    const search = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
      '[type="search"]',
    );
    if (!search) throw new Error('Search input was not rendered');
    search.value = 'sUsPeNsO';
    search.dispatchEvent(new Event('input'));

    expect(component.filtradas().map((pelicula) => pelicula.id)).toEqual([1]);
  });

  it('filters the catalog by the selected genre', () => {
    component.seleccionarGenero('Aventura');

    expect(component.filtradas().map((pelicula) => pelicula.id)).toEqual([2]);
  });
});
