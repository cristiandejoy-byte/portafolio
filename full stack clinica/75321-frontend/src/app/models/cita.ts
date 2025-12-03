// src/app/models/cita.ts

export interface Cita {
  id: number;
  fechaCita?: string;
  motivo?: string;
  pacienteId?: number;
  medicoId?: number;
}
