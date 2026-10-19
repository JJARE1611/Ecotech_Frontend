export interface HistorialPuntosDTO {
  id?: number;
  idusuario: number;
  puntosobtenidos: number;
  tipomovimiento: string;
  descripcion: string;
  puntoscanjeados: number;
  fecha: string;
}

export interface ResumenPuntos {
  disponibles: number;
  obtenidos: number;
  canjeados: number;
}
