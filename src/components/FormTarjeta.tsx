// src/components/FormTarjeta.tsx
import React, { useState, useEffect } from "react";
import type { FormEvent } from "react";
import type { Tarjeta } from "../types/Tarjeta";
import "./FormTarjeta.css";

interface FormTarjetaProps {
  tarjetaInicial?: Tarjeta;
  onSubmit: (
    data: Omit<Tarjeta, "idTarjeta">
  ) => Promise<void>;
  onCancel: () => void;
}

const FormTarjeta: React.FC<FormTarjetaProps> = ({
  tarjetaInicial,
  onSubmit,
  onCancel
}) => {
  const idUsuario = localStorage.getItem("idUsuario") || "";
  const [nombre, setNombre] = useState<string>(tarjetaInicial?.nombreTarjeta || "");
  const [limite, setLimite] = useState<number>(tarjetaInicial?.limite || 0);
  const [fechaCorte, setFechaCorte] = useState<string>(
    tarjetaInicial?.fechaCorte.substring(0,10) || new Date().toISOString().substring(0,10)
  );
  const [activo, setActivo] = useState<boolean>(tarjetaInicial?.activo ?? true);
  const [error, setError] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (tarjetaInicial) {
      setNombre(tarjetaInicial.nombreTarjeta);
      setLimite(tarjetaInicial.limite);
      setFechaCorte(tarjetaInicial.fechaCorte.substring(0,10));
      setActivo(tarjetaInicial.activo);
    }
  }, [tarjetaInicial]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!nombre.trim()) return setError("Nombre requerido");
    if (limite <= 0) return setError("Límite debe ser > 0");
    setError("");
    try {
      setSubmitting(true);
      await onSubmit({
        idUsuario,
        nombreTarjeta: nombre.trim(),
        limite,
        fechaCorte: new Date(fechaCorte).toISOString(),
        activo
      });
    } catch (err) {
      console.error("Error guardando tarjeta:", err);
      setError("No se pudo guardar");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="form-tarjeta" onSubmit={handleSubmit}>
      <h3 className="tarjeta-title">
        {tarjetaInicial ? "Editar Tarjeta" : "Nueva Tarjeta"}
      </h3>
      <div className="tar-group">
        <label className="tar-label">Nombre</label>
        <input
          type="text"
          className="tar-input"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          required
        />
      </div>
      <div className="tar-group">
        <label className="tar-label">Límite</label>
        <input
          type="number"
          className="tar-input"
          value={limite}
          onChange={e => setLimite(+e.target.value)}
          min={1}
          required
        />
      </div>
      <div className="tar-group">
        <label className="tar-label">Fecha de Corte</label>
        <input
          type="date"
          className="tar-input"
          value={fechaCorte}
          onChange={e => setFechaCorte(e.target.value)}
          required
        />
      </div>
      {tarjetaInicial && (
        <div className="tar-group">
          <label>
            <input
              type="checkbox"
              checked={activo}
              onChange={e => setActivo(e.target.checked)}
            /> Activo
          </label>
        </div>
      )}
      {error && <div className="tar-error">{error}</div>}
      <div className="tar-buttons">
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

export default FormTarjeta;
