export interface Medicamento {
  id?: number;
  nombre: string;
  descripcion?: string;
  presentacion?: string;
  fechaCompra: string | Date;
  fechaVence: string | Date;
  fechaCreacionRegistro?: string | Date;
  fechaModificacionRegistro?: string | Date | null;
}