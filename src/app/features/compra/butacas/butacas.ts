import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Butaca, Funcion } from '../../../core/models';
import { Butacas } from '../../../core/butacas';
import { Peliculas } from '../../../core/peliculas';

@Component({
  selector: 'app-seleccion-butacas',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './butacas.html',
  styleUrl: './butacas.scss',
})
export class SeleccionButacas implements OnInit {
  private ruta = inject(ActivatedRoute);
  private peliculas = inject(Peliculas);
  private servicioButacas = inject(Butacas);
  private destroyRef = inject(DestroyRef);
  private detenerRealtime?: () => void;
  private solicitudActual = 0;
  private funcionSolicitada: number | null = null;
  private mapaListo = false;
  private cambiosDuranteCarga = new Map<number, boolean>();

  funcion = signal<Funcion | null>(null);
  butacas = signal<Butaca[]>([]);
  ocupadas = signal<ReadonlySet<number>>(new Set());
  seleccionadas = signal<number[]>([]);
  cargando = signal(true);
  error = signal('');
  errorRealtime = signal('');
  aviso = signal('');

  filas = computed(() => {
    const filas = [...new Set(this.butacas().map(({ fila }) => fila))];
    return filas.sort((a, b) => a.localeCompare(b));
  });
  butacasElegidas = computed(() =>
    this.butacas().filter(({ id }) => this.seleccionadas().includes(id)),
  );
  total = computed(() => {
    const funcion = this.funcion();
    if (!funcion) return 0;

    return this.butacasElegidas().reduce((suma, butaca) => {
      const precio =
        butaca.tipo === 'vip'
          ? Math.round(funcion.precio_base * (1 + funcion.recargo_vip_pct / 100) * 100) / 100
          : funcion.precio_base;
      return suma + precio;
    }, 0);
  });

  constructor() {
    this.destroyRef.onDestroy(() => this.detenerRealtime?.());
  }

  ngOnInit() {
    this.ruta.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((parametros) => {
      void this.cargar(Number(parametros.get('id')));
    });
  }

  butacasDelBloque(fila: string, bloque: number): Butaca[] {
    return this.butacas().filter((butaca) => butaca.fila === fila && butaca.bloque === bloque);
  }

  esAccesible(butaca: Butaca): boolean {
    return butaca.tipo === 'accesible';
  }

  alternar(butaca: Butaca) {
    if (this.ocupadas().has(butaca.id)) return;

    const seleccionActual = this.seleccionadas();
    if (seleccionActual.includes(butaca.id)) {
      this.seleccionadas.set(seleccionActual.filter((id) => id !== butaca.id));
      this.aviso.set('');
      return;
    }

    if (seleccionActual.length >= 8) {
      this.aviso.set('Podés seleccionar hasta 8 butacas por compra.');
      return;
    }

    this.seleccionadas.set([...seleccionActual, butaca.id]);
    this.aviso.set('');
  }

  limpiarSeleccion() {
    this.seleccionadas.set([]);
    this.aviso.set('');
  }

  reintentar() {
    void this.cargar(Number(this.ruta.snapshot.paramMap.get('id')));
  }

  etiquetaButaca(butaca: Butaca): string {
    const tipo = butaca.tipo === 'vip' ? 'VIP' : butaca.tipo === 'accesible' ? 'accesible' : 'normal';
    const estado = this.ocupadas().has(butaca.id)
      ? 'ocupada'
      : this.seleccionadas().includes(butaca.id)
        ? 'seleccionada'
        : 'disponible';
    return `Fila ${butaca.fila}, asiento ${butaca.numero}, ${tipo}, ${estado}`;
  }

  async cargar(id: number) {
    const solicitud = ++this.solicitudActual;
    this.detenerRealtime?.();
    this.detenerRealtime = undefined;
    this.funcionSolicitada = null;
    this.mapaListo = false;
    this.cambiosDuranteCarga.clear();
    this.funcion.set(null);
    this.butacas.set([]);
    this.ocupadas.set(new Set());
    this.seleccionadas.set([]);
    this.error.set('');
    this.errorRealtime.set('');
    this.aviso.set('');
    this.cargando.set(true);

    if (!Number.isSafeInteger(id) || id < 1) {
      this.error.set('El identificador de la función no es válido.');
      this.cargando.set(false);
      return;
    }

    this.funcionSolicitada = id;
    this.detenerRealtime = this.servicioButacas.suscribirOcupacion(
      id,
      (butacaId, ocupada) => this.recibirCambio(id, butacaId, ocupada),
      (error) => {
        if (solicitud !== this.solicitudActual) return;
        console.error('La actualización en tiempo real de butacas falló.', error);
        this.errorRealtime.set(
          'No pudimos conectar la actualización en vivo. La disponibilidad se confirmará al finalizar la compra.',
        );
      },
    );

    try {
      const funcion = await this.peliculas.obtenerFuncion(id);
      const [butacas, ocupadas] = await Promise.all([
        this.servicioButacas.listarPorSala(funcion.sala_id),
        this.servicioButacas.ocupadas(id),
      ]);

      if (solicitud !== this.solicitudActual) return;
      this.funcion.set(funcion);
      this.butacas.set(butacas);

      const idsOcupados = new Set(ocupadas);
      for (const [butacaId, estaOcupada] of this.cambiosDuranteCarga) {
        if (estaOcupada) idsOcupados.add(butacaId);
        else idsOcupados.delete(butacaId);
      }
      this.ocupadas.set(idsOcupados);
      this.mapaListo = true;
    } catch (error: unknown) {
      if (solicitud !== this.solicitudActual) return;
      console.error('No se pudo cargar la disponibilidad de butacas.', error);
      this.error.set('No pudimos cargar el mapa de butacas. Revisá tu conexión e intentá de nuevo.');
    } finally {
      if (solicitud === this.solicitudActual) this.cargando.set(false);
    }
  }

  private recibirCambio(funcionId: number, butacaId: number, ocupada: boolean) {
    if (this.funcionSolicitada !== funcionId) return;

    if (!this.mapaListo) {
      this.cambiosDuranteCarga.set(butacaId, ocupada);
      return;
    }

    const actualizadas = new Set(this.ocupadas());
    if (ocupada) {
      actualizadas.add(butacaId);
      if (this.seleccionadas().includes(butacaId)) {
        this.seleccionadas.update((ids) => ids.filter((id) => id !== butacaId));
        this.aviso.set('Una de tus butacas acaba de ocuparse y se quitó de la selección.');
      }
    } else {
      actualizadas.delete(butacaId);
    }
    this.ocupadas.set(actualizadas);
  }
}
