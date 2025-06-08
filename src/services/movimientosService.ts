// src/services/movimientosService.ts

import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp,
  doc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";
import { db } from "../firebase";
import type { Movimiento } from "../types/Movimiento";

const MOVIMIENTOS_COLL = "movimientos";

/**
 * Obtiene todos los movimientos de un usuario (opcionalmente filtrados por tipo).
 */
export const fetchMovimientosByUsuario = async (
  idUsuario: string,
  tipo?: "ingreso" | "gasto"
): Promise<Movimiento[]> => {
  const movimientosRef = collection(db, MOVIMIENTOS_COLL);
  let q = query(movimientosRef, where("idUsuario", "==", idUsuario));
  if (tipo) {
    q = query(
      movimientosRef,
      where("idUsuario", "==", idUsuario),
      where("tipo", "==", tipo)
    );
  }
  const snapshot = await getDocs(q);
  const result: Movimiento[] = [];
  snapshot.forEach((docSnap) => {
    const data = docSnap.data() as any;
    result.push({
      idMovimiento: data.idMovimiento,
      idUsuario: data.idUsuario,
      tipo: data.tipo,
      monto: data.monto,
      fecha: data.fecha,
      idCategoria: data.idCategoria,
      idTarjeta: data.idTarjeta,
      descripcion: data.descripcion,
      creadoEn: data.creadoEn?.toDate().toISOString(),
      actualizadoEn: data.actualizadoEn?.toDate().toISOString(),
    });
  });
  return result;
};

/**
 * Crea un nuevo movimiento. Omite campos con valor undefined
 * para no enviarlos a Firestore.
 */
export const createMovimiento = async (
  mov: Omit<Movimiento, "idMovimiento" | "creadoEn" | "actualizadoEn">
): Promise<void> => {
  const ref = collection(db, MOVIMIENTOS_COLL);

  // Construyo el payload sin campos undefined
  const payload: any = {
    idUsuario: mov.idUsuario,
    tipo: mov.tipo,
    monto: mov.monto,
    fecha: mov.fecha,
    idCategoria: mov.idCategoria,
    creadoEn: Timestamp.now(),
    actualizadoEn: Timestamp.now(),
    idMovimiento: "",            // lo completaré luego
  };
  if (mov.idTarjeta) payload.idTarjeta = mov.idTarjeta;
  if (mov.descripcion) payload.descripcion = mov.descripcion;

  // Inserto el doc
  const newDoc = await addDoc(ref, payload);

  // Actualizo el campo idMovimiento con el auto-ID generado
  const docRef = doc(db, MOVIMIENTOS_COLL, newDoc.id);
  await updateDoc(docRef, { idMovimiento: newDoc.id });
};

/**
 * Actualiza un movimiento existente.
 * También omite campos undefined para no romper Firestore.
 */
export const updateMovimiento = async (
  idMovimiento: string,
  cambios: Partial<Omit<Movimiento, "idUsuario" | "idMovimiento" | "creadoEn">>
): Promise<void> => {
  const docRef = doc(db, MOVIMIENTOS_COLL, idMovimiento);

  // Construyo el objeto a actualizar sin undefined
  const payload: any = { actualizadoEn: Timestamp.now() };
  if (cambios.tipo !== undefined) payload.tipo = cambios.tipo;
  if (cambios.monto !== undefined) payload.monto = cambios.monto;
  if (cambios.fecha !== undefined) payload.fecha = cambios.fecha;
  if (cambios.idCategoria !== undefined) payload.idCategoria = cambios.idCategoria;
  if (cambios.idTarjeta) payload.idTarjeta = cambios.idTarjeta; 
  if (cambios.descripcion) payload.descripcion = cambios.descripcion;

  await updateDoc(docRef, payload);
};

/**
 * Elimina un movimiento.
 */
export const deleteMovimiento = async (idMovimiento: string): Promise<void> => {
  const docRef = doc(db, MOVIMIENTOS_COLL, idMovimiento);
  await deleteDoc(docRef);
};
