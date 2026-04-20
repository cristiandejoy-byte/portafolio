// bar-system/src/context/sedes.js
// Separado de AuthContext para compatibilidad con Vite Fast Refresh.
// Importa desde aquí en cualquier archivo que necesite SEDES:
//   import { SEDES } from '../../context/sedes.js';

export const SEDES = [
  { id: 1, nombre: 'Bogotá',   ciudad: 'Bogotá D.C.' },
  { id: 2, nombre: 'Cali',     ciudad: 'Cali' },
  { id: 3, nombre: 'Medellín', ciudad: 'Medellín' },
];
