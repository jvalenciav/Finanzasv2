// src/services/tarjetasService.ts
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp
} from "firebase/firestore";
import { db } from "../firebase";
import type { Tarjeta } from "../types/Tarjeta";

const TARJETAS_COLL = "tarjetas";

/** Obtiene las tarjetas activas de un usuario */
export const fetchTarjetasByUsuario = async (
  idUsuario: string
): Promise<Tarjeta[]> => {
  const ref = collection(db, TARJETAS_COLL);
  const q = query(ref, where("idUsuario", "==", idUsuario), where("activo", "==", true));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as Tarjeta);
};

/** Crea una nueva tarjeta y retorna su id */
export const createTarjeta = async (
  data: Omit<Tarjeta, "idTarjeta" | "activo"> & { activo?: boolean }
): Promise<string> => {
  const ref = collection(db, TARJETAS_COLL);
  const newDoc = await addDoc(ref, {
    ...data,
    idTarjeta: "",
    activo: data.activo ?? true,
    fechaCreacion: Timestamp.now()
  });
  const docRef = doc(db, TARJETAS_COLL, newDoc.id);
  await updateDoc(docRef, { idTarjeta: newDoc.id });
  return newDoc.id;
};

/** Actualiza una tarjeta existente */
export const updateTarjeta = async (
  idTarjeta: string,
  data: Partial<Omit<Tarjeta, "idTarjeta" | "idUsuario">>
): Promise<void> => {
  const docRef = doc(db, TARJETAS_COLL, idTarjeta);
  const payload: any = {};
  if (data.nombreTarjeta) payload.nombreTarjeta = data.nombreTarjeta;
  if (data.limite !== undefined) payload.limite = data.limite;
  if (data.fechaCorte) payload.fechaCorte = data.fechaCorte;
  if (data.activo !== undefined) payload.activo = data.activo;
  await updateDoc(docRef, payload);
};

/** Elimina (o marca inactiva) una tarjeta */
export const deleteTarjeta = async (idTarjeta: string): Promise<void> => {
  const docRef = doc(db, TARJETAS_COLL, idTarjeta);
  // opcionalmente se podría hacer un update de activo=false
  await deleteDoc(docRef);
};
