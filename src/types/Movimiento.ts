// src/types/Movimiento.ts

export interface Movimiento {
  idMovimiento: string;
  idUsuario: string;
  tipo: "ingreso" | "gasto";
  monto: number;
  fecha: string;           // ISO string, p.ej. "2025-06-06T14:30:00.000Z"
  idCategoria: string;
  idTarjeta?: string;      // opcional (solo si es gasto con tarjeta)
  descripcion?: string;
  creadoEn?: string;       // timestamp ISO de Firestore
  actualizadoEn?: string;  // timestamp ISO de Firestore
}
