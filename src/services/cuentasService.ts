import {
    collection,
    query,
    where,
    getDocs
  } from "firebase/firestore";
  import { db } from "../firebase";
  import type { Cuenta } from "../types/Cuenta";
  
  export const fetchCuentasByUsuario = async (
    idUsuario: string
  ): Promise<Cuenta[]> => {
    const cuentasRef = collection(db, "cuentas");
    const q = query(cuentasRef, where("idUsuario", "==", idUsuario));
    const snapshot = await getDocs(q);
    const result: Cuenta[] = [];
    snapshot.forEach((doc) => {
      result.push(doc.data() as Cuenta);
    });
    return result;
  };
  