export interface ProductoDTO {
  id?: number;
  nombre: string;
  descripcion: string;
  fecha: string;
  puntosrequerido: number;
  stock: number;
  precioReferencia?: number;
  categoria?: string;
  imagen?: string;
  estado: string;
  permiteEntregaDigital?: boolean;
}

export interface CrearProductoDTO {
  nombre: string;
  descripcion: string;
  fecha: string;
  puntosrequerido: number;
  stock: number;
  precioReferencia?: number;
  categoria?: string;
  imagen?: string;
  estado?: string;
  permiteEntregaDigital?: boolean;
}
