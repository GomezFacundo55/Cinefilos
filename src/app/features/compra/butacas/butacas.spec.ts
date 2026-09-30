import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { Butaca, Funcion } from '../../../core/models';
import { Butacas } from '../../../core/butacas';
import { Peliculas } from '../../../core/peliculas';
import { SeleccionButacas } from './butacas';

describe('SeleccionButacas', () => {
  const funcion: Funcion = {
    id: 12,
    inicio: '2026-10-10T20:30:00-03:00',
    formato: '2D',
    idioma: 'Castellano',
    precio_base: 5000,
    sala_id: 2,
    recargo_vip_pct: 30,
  };
  let siguienteId = 1;
  const butacas: Butaca[] = [...'ABCDEFGHIJKLMNOPQRST'].flatMap((fila) => {
    if (fila === 'E' || fila === 'F') {
      return Array.from({ length: 28 }, (_, indice): Butaca => ({
        id: siguienteId++,
        sala_id: 2,
        fila,
        numero: indice + 1,
        tipo: 'accesible',
        bloque: indice < 4 ? 1 : indice < 24 ? 2 : 3,
      }));
    }

    return Array.from({ length: 28 }, (_, indice): Butaca => ({
      id: siguienteId++,
      sala_id: 2,
      fila,
      numero: indice + 1,
      tipo: fila >= 'R' ? 'vip' : 'normal',
      bloque: indice < 4 ? 1 : indice < 24 ? 2 : 3,
    }));
  });
  const butacaVip = butacas.find(({ tipo }) => tipo === 'vip')!;

  let alCambiar: ((butacaId: number, ocupada: boolean) => void) | undefined;
  let listarButacas: ReturnType<typeof vi.fn>;
  let listarOcupadas: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    alCambiar = undefined;
    listarButacas = vi.fn().mockResolvedValue(butacas);
    listarOcupadas = vi.fn().mockResolvedValue([butacaVip.id]);
    await TestBed.configureTestingModule({
      imports: [SeleccionButacas],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ id: '12' })), snapshot: { paramMap: convertToParamMap({ id: '12' }) } },
        },
        {
          provide: Peliculas,
          useValue: { obtenerFuncion: vi.fn().mockResolvedValue(funcion) },
        },
        {
          provide: Butacas,
          useValue: {
            listarPorSala: listarButacas,
            ocupadas: listarOcupadas,
            suscribirOcupacion: vi.fn((_id: number, callback: (seatId: number, occupied: boolean) => void) => {
              alCambiar = callback;
              return vi.fn();
            }),
          },
        },
      ],
    }).compileComponents();
  });

  it('loads the room seats and marks sold seats as unavailable', async () => {
    const fixture = TestBed.createComponent(SeleccionButacas);
    fixture.detectChanges();
    await vi.waitFor(() => expect(fixture.componentInstance.cargando()).toBe(false));
    fixture.detectChanges();

    const html = (fixture.nativeElement as HTMLElement).textContent ?? '';
    const soldSeat = (fixture.nativeElement as HTMLElement).querySelector(
      `[aria-label="Fila ${butacaVip.fila}, asiento ${butacaVip.numero}, VIP, ocupada"]`,
    );

    expect(html).toContain('Seleccioná tus butacas');
    expect(html).toContain('Sala 2');
    expect(html).toContain('Pasillo frontal');
    expect(soldSeat?.hasAttribute('disabled')).toBe(true);
    expect(fixture.componentInstance.filas()).toEqual([...'ABCDEFGHIJKLMNOPQRST']);
    expect(html).toContain('Filas E · F');
    expect(html).toContain('Resto de la sala');
    expect(
      (fixture.nativeElement as HTMLElement).querySelectorAll('.pasillo-central'),
    ).toHaveLength(fixture.componentInstance.filas().length * 2);
    const filasAccesibles = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('.fila-accesible'),
    );
    expect(filasAccesibles).toHaveLength(2);
    for (const filaAccesible of filasAccesibles) {
      expect(filaAccesible.getAttribute('aria-label')).toContain('butacas accesibles');
      expect(filaAccesible.querySelectorAll('.bloque-1 .butaca.accesible')).toHaveLength(4);
      expect(filaAccesible.querySelectorAll('.bloque-2 .butaca.accesible')).toHaveLength(20);
      expect(filaAccesible.querySelectorAll('.bloque-3 .butaca.accesible')).toHaveLength(4);
    }
    for (const fila of ['J', 'K']) {
      const filaNormal = (fixture.nativeElement as HTMLElement).querySelector(
        `.fila[aria-label="Fila ${fila}"]`,
      );
      expect(filaNormal?.querySelectorAll('.bloque-1 .butaca')).toHaveLength(4);
      expect(filaNormal?.querySelectorAll('.bloque-2 .butaca')).toHaveLength(20);
      expect(filaNormal?.querySelectorAll('.bloque-3 .butaca')).toHaveLength(4);
    }
    expect(butacas.filter(({ fila, tipo }) => (fila === 'E' || fila === 'F') && tipo === 'accesible'))
      .toHaveLength(56);
  });

  it('calculates the VIP surcharge and releases a seat selected by another customer', async () => {
    listarOcupadas.mockResolvedValue([]);
    const fixture = TestBed.createComponent(SeleccionButacas);
    fixture.detectChanges();
    await vi.waitFor(() => expect(fixture.componentInstance.cargando()).toBe(false));

    const component = fixture.componentInstance;
    component.alternar(butacas[0]);
    component.alternar(butacaVip);
    expect(component.total()).toBe(11500);

    alCambiar?.(1, true);
    expect(component.ocupadas().has(1)).toBe(true);
    expect(component.seleccionadas()).toEqual([butacaVip.id]);
    expect(component.total()).toBe(6500);
    expect(component.aviso()).toContain('acaba de ocuparse');
  });

  it('limits seat selection to eight seats', async () => {
    const nueveButacas = Array.from({ length: 9 }, (_, indice): Butaca => ({
      id: indice + 4,
      sala_id: 2,
      fila: 'A',
      numero: indice + 1,
      tipo: 'normal',
      bloque: 2,
    }));
    listarButacas.mockResolvedValue(nueveButacas);

    const fixture = TestBed.createComponent(SeleccionButacas);
    fixture.detectChanges();
    await vi.waitFor(() => expect(fixture.componentInstance.cargando()).toBe(false));

    for (const butaca of nueveButacas) fixture.componentInstance.alternar(butaca);
    expect(fixture.componentInstance.seleccionadas()).toHaveLength(8);
    expect(fixture.componentInstance.aviso()).toContain('hasta 8');
  });
});
