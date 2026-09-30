import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { Funcion, Pelicula } from '../../../core/models';
import { Peliculas } from '../../../core/peliculas';
import { Detalle } from './detalle';

describe('Detalle', () => {
  const pelicula: Pelicula = {
    id: 42,
    titulo: 'La última función',
    sinopsis: 'Una historia sobre el cine.',
    duracion_min: 110,
    poster_url: null,
    clasificacion_edad: '13+',
    estreno: '2026-09-01',
    generos: ['Drama', 'Suspenso'],
  };
  const funciones: Funcion[] = [
    {
      id: 7,
      inicio: '2026-10-10T20:30:00-03:00',
      formato: '2D',
      idioma: 'Castellano',
      precio_base: 5000,
      sala_id: 2,
      recargo_vip_pct: 30,
    },
  ];

  let obtener: ReturnType<typeof vi.fn>;
  let listarFunciones: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    obtener = vi.fn().mockResolvedValue(pelicula);
    listarFunciones = vi.fn().mockResolvedValue(funciones);

    await TestBed.configureTestingModule({
      imports: [Detalle],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ id: '42' })) },
        },
        {
          provide: Peliculas,
          useValue: { obtener, funciones: listarFunciones },
        },
      ],
    }).compileComponents();
  });

  it('loads and displays the movie details and its scheduled shows', async () => {
    const fixture = TestBed.createComponent(Detalle);
    fixture.detectChanges();
    await vi.waitFor(() => {
      expect(fixture.componentInstance.pelicula()).toEqual(pelicula);
    });
    fixture.detectChanges();

    const html = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(html).toContain('La última función');
    expect(html).toContain('Próximas funciones');
    expect(html).toContain('Sala 2');
    expect(html).toContain('2D · Castellano');
    expect(obtener).toHaveBeenCalledWith(42);
    expect(listarFunciones).toHaveBeenCalledWith(42);
  });

  it('shows an error for an invalid movie identifier without querying the service', async () => {
    TestBed.overrideProvider(ActivatedRoute, {
      useValue: { paramMap: of(convertToParamMap({ id: 'no-es-un-id' })) },
    });

    const fixture = TestBed.createComponent(Detalle);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const html = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(html).toContain('El identificador de la película no es válido.');
    expect(obtener).not.toHaveBeenCalled();
    expect(listarFunciones).not.toHaveBeenCalled();
  });
});
