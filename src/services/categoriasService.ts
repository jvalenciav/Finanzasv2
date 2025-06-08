// src/services/categoriasService.ts

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
import type { Categoria } from "../types/Categoria";

const CATEGORIAS_COLL = "categorias";

/** Obtiene las categorías de un usuario, opcionalmente filtrando por tipo */
export const fetchCategoriasByUsuario = async (
  idUsuario: string,
  tipo?: "ingreso" | "gasto"
): Promise<Categoria[]> => {
  const categoriasRef = collection(db, CATEGORIAS_COLL);
  let q = query(categoriasRef, where("idUsuario", "==", idUsuario));
  if (tipo) {
    q = query(
      categoriasRef,
      where("idUsuario", "==", idUsuario),
      where("tipo", "==", tipo)
    );
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docSnap => docSnap.data() as Categoria);
};

/** Crea una nueva categoría y retorna su id */
export const createCategoria = async (
  data: Omit<Categoria, "idCategoria">
): Promise<string> => {
  const ref = collection(db, CATEGORIAS_COLL);
  const newDoc = await addDoc(ref, {
    ...data,
    idCategoria: "",
    fechaCreacion: Timestamp.now()
  });
  const docRef = doc(db, CATEGORIAS_COLL, newDoc.id);
  await updateDoc(docRef, { idCategoria: newDoc.id });
  return newDoc.id;
};

/** Actualiza una categoría existente */
export const updateCategoria = async (
  idCategoria: string,
  data: { nombre: string; tipo: "ingreso" | "gasto" }
): Promise<void> => {
  const docRef = doc(db, CATEGORIAS_COLL, idCategoria);
  await updateDoc(docRef, { ...data });
};

/** Elimina una categoría */
export const deleteCategoria = async (idCategoria: string): Promise<void> => {
  const docRef = doc(db, CATEGORIAS_COLL, idCategoria);
  await deleteDoc(docRef);
};
