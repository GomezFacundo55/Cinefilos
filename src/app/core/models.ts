export interface Pelicula {
  id: number;
  titulo: string;
  sinopsis: string | null;
  duracion_min: number;
  poster_url: string | null;
  clasificacion_edad: string | null;
  estreno: string | null;
  generos: string[];
}

export interface Funcion {
  id: number;
  inicio: string;
  formato: string;
  idioma: string;
  precio_base: number;
  sala_id: number;
  recargo_vip_pct: number;
}

export type TipoButaca = 'normal' | 'accesible' | 'vip';

export interface Butaca {
  id: number;
  sala_id: number;
  fila: string;
  numero: number;
  tipo: TipoButaca;
  bloque: number | null;
}