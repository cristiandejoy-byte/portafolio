import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Especializacion } from '../models/especilizacion';

@Injectable({
  providedIn: 'root'
})
export class EspecializacionesService {

  private apiBase = 'http://localhost:8080/clinica/v1/especializacion';

  constructor(private http: HttpClient) { }

  listar(): Observable<Especializacion[]> {
    return this.http.get<Especializacion[]>(`${this.apiBase}/listar`)
      .pipe(catchError(this.handleError));
  }

  buscarPorCodigo(codigo: string): Observable<Especializacion> {
    return this.http.get<Especializacion>(`${this.apiBase}/buscar?codigo=${encodeURIComponent(codigo)}`)
      .pipe(catchError(this.handleError));
  }

  crear(especializacion: Especializacion): Observable<Especializacion> {
    return this.http.post<Especializacion>(`${this.apiBase}/crear`, especializacion)
      .pipe(catchError(this.handleError));
  }

  actualizar(id: number, especializacion: Especializacion): Observable<Especializacion> {
    return this.http.put<Especializacion>(`${this.apiBase}/actualizar/${id}`, especializacion)
      .pipe(catchError(this.handleError));
  }

  private handleError(err: HttpErrorResponse) {
    const message = err.error?.message || err.message || 'Error en la comunicación con el servidor';
    return throwError(() => ({ status: err.status, message }));
  }
}
