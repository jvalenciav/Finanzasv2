// src/components/FormCategoria.tsx

import React, { useState, useEffect } from "react";
import type { FormEvent } from "react";
import type { Categoria } from "../types/Categoria";
import "./FormCategoria.css";

interface FormCategoriaProps {
  categoriaInicial?: Categoria;
  onSubmit: (data: Omit<Categoria, "idCategoria">) => Promise<void>;
  onCancel: () => void;
}

const FormCategoria: React.FC<FormCategoriaProps> = ({
  categoriaInicial,
  onSubmit,
  onCancel
}) => {
  const idUsuario = localStorage.getItem("idUsuario") || "";
  const [nombre, setNombre] = useState<string>(categoriaInicial?.nombre || "");
  const [tipo, setTipo] = useState<"ingreso" | "gasto">(categoriaInicial?.tipo || "gasto");
  const [error, setError] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (categoriaInicial) {
      setNombre(categoriaInicial.nombre);
      setTipo(categoriaInicial.tipo);
    }
  }, [categoriaInicial]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!nombre.trim()) return setError("Escribe un nombre.");
    setError("");
    try {
      setSubmitting(true);
      await onSubmit({ idUsuario, nombre: nombre.trim(), tipo });
    } catch (err) {
      console.error("Error guardando categoría:", err);
      setError("No se pudo guardar. Revisa la consola.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="form-categoria" onSubmit={handleSubmit}>
      <h3 className="cat-title">
        {categoriaInicial ? "Editar Categoría" : "Nueva Categoría"}
      </h3>
      <div className="cat-group">
        <label className="cat-label">Tipo</label>
        <select
          className="cat-select"
          value={tipo}
          onChange={e => setTipo(e.target.value as any)}
        >
          <option value="ingreso">Ingreso</option>
          <option value="gasto">Gasto</option>
        </select>
      </div>
      <div className="cat-group">
        <label className="cat-label">Nombre</label>
        <input
          type="text"
          className="cat-input"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          required
        />
      </div>
      {error && <div className="cat-error">{error}</div>}
      <div className="cat-buttons">
        <button
          type="button"
          className="btn-cancel"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn-submit"
          disabled={submitting}
        >
          {submitting ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
};

export default FormCategoria;
