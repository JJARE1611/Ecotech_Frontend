import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductoDTO, CrearProductoDTO } from '../models/producto.model';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = 'http://localhost:8081/api/productos';

  constructor(private http: HttpClient) {}

  // ========== MÉTODOS CRUD BÁSICOS ==========

  /**
   * Obtener todos los productos
   * GET /api/productos
   */
  listarProductos(): Observable<ProductoDTO[]> {
    return this.http.get<ProductoDTO[]>(this.apiUrl);
  }

  /**
   * Obtener un producto por ID
   * GET /api/productos/{id}
   */
  obtenerProducto(id: number): Observable<ProductoDTO> {
    return this.http.get<ProductoDTO>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crear un producto (SOLO ADMIN)
   * POST /api/productos
   */
  crearProducto(producto: CrearProductoDTO): Observable<ProductoDTO> {
    return this.http.post<ProductoDTO>(this.apiUrl, producto);
  }

  /**
   * Actualizar un producto (SOLO ADMIN)
   * PUT /api/productos/{id}
   */
  actualizarProducto(id: number, producto: CrearProductoDTO): Observable<ProductoDTO> {
    return this.http.put<ProductoDTO>(`${this.apiUrl}/${id}`, producto);
  }

  /**
   * Eliminar un producto (SOLO ADMIN)
   * DELETE /api/productos/{id}
   */
  eliminarProducto(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // ========== NUEVOS MÉTODOS PARA FILTROS ==========

  /**
   * Listar productos activos
   * GET /api/productos/activos
   */
  listarProductosActivos(): Observable<ProductoDTO[]> {
    return this.http.get<ProductoDTO[]>(`${this.apiUrl}/activos`);
  }

  /**
   * Listar productos disponibles (con stock)
   * GET /api/productos/disponibles
   */
  listarProductosDisponibles(): Observable<ProductoDTO[]> {
    return this.http.get<ProductoDTO[]>(`${this.apiUrl}/disponibles`);
  }

  /**
   * Listar por categoría
   * GET /api/productos/categoria/{categoria}
   */
  listarPorCategoria(categoria: string): Observable<ProductoDTO[]> {
    return this.http.get<ProductoDTO[]>(`${this.apiUrl}/categoria/${categoria}`);
  }

  /**
   * Listar por estado
   * GET /api/productos/estado/{estado}
   */
  listarPorEstado(estado: string): Observable<ProductoDTO[]> {
    return this.http.get<ProductoDTO[]>(`${this.apiUrl}/estado/${estado}`);
  }

  /**
   * Obtener todas las categorías
   * GET /api/productos/categorias
   */
  listarCategorias(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categorias`);
  }

  /**
   * Filtrar productos por categoría y/o estado
   * GET /api/productos/filtrar?categoria=X&estado=Y
   */
  filtrarProductos(categoria?: string, estado?: string): Observable<ProductoDTO[]> {
    let params = new HttpParams();
    if (categoria) {
      params = params.set('categoria', categoria);
    }
    if (estado) {
      params = params.set('estado', estado);
    }
    return this.http.get<ProductoDTO[]>(`${this.apiUrl}/filtrar`, { params });
  }

  /**
   * Actualizar solo el stock (SOLO ADMIN)
   * PATCH /api/productos/{id}/stock
   */
  actualizarStock(id: number, nuevoStock: number): Observable<ProductoDTO> {
    return this.http.patch<ProductoDTO>(`${this.apiUrl}/${id}/stock`, { stock: nuevoStock });
  }

  /**
   * Cambiar estado del producto (SOLO ADMIN)
   * PATCH /api/productos/{id}/estado
   */
  cambiarEstado(id: number, nuevoEstado: string): Observable<ProductoDTO> {
    return this.http.patch<ProductoDTO>(`${this.apiUrl}/${id}/estado`, { estado: nuevoEstado });
  }

  /**
   * Listar productos ordenados por puntos ascendente
   * GET /api/productos/ordenar/puntos-asc
   */
  listarPorPuntosAscendente(): Observable<ProductoDTO[]> {
    return this.http.get<ProductoDTO[]>(`${this.apiUrl}/ordenar/puntos-asc`);
  }

  /**
   * Listar productos ordenados por puntos descendente
   * GET /api/productos/ordenar/puntos-desc
   */
  listarPorPuntosDescendente(): Observable<ProductoDTO[]> {
    return this.http.get<ProductoDTO[]>(`${this.apiUrl}/ordenar/puntos-desc`);
  }

  actualizarPermiteEntregaDigital(id: number, permiteEntregaDigital: boolean): Observable<ProductoDTO> {
    return this.http.put<ProductoDTO>(
      `${this.apiUrl}/${id}/permite-entrega-digital`,
      { permiteEntregaDigital }
    );
  }

  listarProductosDigitales(): Observable<ProductoDTO[]> {
    return this.http.get<ProductoDTO[]>(`${this.apiUrl}/digitales`);
  }

}
