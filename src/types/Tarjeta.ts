// src/types/Tarjeta.ts
export interface Tarjeta {
  idTarjeta: string;
  idUsuario: string;
  nombreTarjeta: string;
  limite: number;
  fechaCorte: string; // ISO string, e.g. "2025-06-06T00:00:00.000Z"
  activo: boolean;
}
