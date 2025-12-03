export interface Receta {
  id?: number;
  medicamentoId: number;
  dosis: string;
  indicaciones?: string;
  cita: {
    id: number;
    paciente?: {
      nombre?: string;
      apellido?: string;
      tipoDocumento?: string;
      numeroDocumento?: string;
    };
    medico?: {
      nombres?: string;
      apellidos?: string;
      especializacion?: {
        nombre?: string;
      };
    };
  };
  fechaCreacionRegistro?: string;
}