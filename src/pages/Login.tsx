// src/pages/Login.tsx

import React, { useState } from "react";
import type { FormEvent } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";
import { signInWithPopup } from "firebase/auth";
import { db, auth, googleProvider } from "../firebase";
import type { Usuario } from "../types/Usuario";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login: React.FC = () => {
  const [usuarioInput, setUsuarioInput] = useState<string>("");
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const usuariosRef = collection(db, "usuarios");
      const q = query(
        usuariosRef,
        where("usuario", "==", usuarioInput.trim())
      );
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        setError("Usuario no encontrado");
        setLoading(false);
        return;
      }
      const docSnap = querySnapshot.docs[0];
      const data = docSnap.data() as Usuario;
      if (data.password !== passwordInput) {
        setError("Contraseña incorrecta");
        setLoading(false);
        return;
      }
      localStorage.setItem("idUsuario", data.idUsuario);
      localStorage.setItem("nombreUsuario", data.nombre);
      setLoading(false);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Error al iniciar sesión");
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const userRef = doc(db, "usuarios", user.uid);
      // Merge user info into Firestore
      await setDoc(
        userRef,
        {
          idUsuario: user.uid,
          usuario: user.email?.split("@")[0] || "",
          nombre: user.displayName || user.email || "",
          password: ""
        },
        { merge: true }
      );
      localStorage.setItem("idUsuario", user.uid);
      localStorage.setItem(
        "nombreUsuario",
        user.displayName || user.email || ""
      );
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Error al registrarse con Google");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-heading">Finanzas V²</h2>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="usuario">Usuario</label>
            <input
              id="usuario"
              type="text"
              value={usuarioInput}
              onChange={(e) => setUsuarioInput(e.target.value)}
              placeholder="Tu usuario"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Tu contraseña"
              required
            />
          </div>
          {error && <div className="login-error">{error}</div>}
          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? "Validando..." : "Iniciar Sesión"}
          </button>
        </form>
        <button
          type="button"
          className="google-button"
          onClick={handleGoogleRegister}
          disabled={loading}
        >
          {loading ? "Cargando..." : "Inicia con Gmail"}
        </button>
      </div>
    </div>
  );
};

export default Login;
