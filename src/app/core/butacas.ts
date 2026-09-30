import { Injectable, inject } from '@angular/core';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Butaca } from './models';
import { SupabaseService } from './supabase';

interface ButacaOcupada {
  butaca_id: number;
}

interface CambioOcupacion {
  butaca_id?: unknown;
  ocupada?: unknown;
}

@Injectable({ providedIn: 'root' })
export class Butacas {
  private supabase = inject(SupabaseService).client;

  async listarPorSala(salaId: number): Promise<Butaca[]> {
    const { data, error } = await this.supabase
      .from('butacas')
      .select('id, sala_id, fila, numero, tipo, bloque')
      .eq('sala_id', salaId)
      .order('fila')
      .order('numero');

    if (error) throw error;
    return data as Butaca[];
  }

  async ocupadas(funcionId: number): Promise<number[]> {
    const { data, error } = await this.supabase.rpc('butacas_ocupadas', {
      p_funcion_id: funcionId,
    });

    if (error) throw error;
    return (data as ButacaOcupada[]).map(({ butaca_id }) => butaca_id);
  }

  suscribirOcupacion(
    funcionId: number,
    alCambiar: (butacaId: number, ocupada: boolean) => void,
    alFallar: (error: Error) => void,
  ): () => void {
    const channel: RealtimeChannel = this.supabase
      .channel(`funcion:${funcionId}`, { config: { private: false } })
      .on('broadcast', { event: 'butaca_actualizada' }, ({ payload }) => {
        const cambio = payload as CambioOcupacion;
        if (
          typeof cambio.butaca_id === 'number' &&
          Number.isSafeInteger(cambio.butaca_id) &&
          typeof cambio.ocupada === 'boolean'
        ) {
          alCambiar(cambio.butaca_id, cambio.ocupada);
        }
      })
      .subscribe((estado, error) => {
        if (estado === 'CHANNEL_ERROR' || estado === 'TIMED_OUT') {
          alFallar(error ?? new Error(`No se pudo conectar al canal de la función ${funcionId}.`));
        }
      });

    return () => {
      void channel.unsubscribe();
    };
  }
}
