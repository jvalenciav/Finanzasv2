// src/components/FormMovimiento.tsx

import React, { useState, useEffect } from "react";
import type { FormEvent } from "react";
import type { Movimiento } from "../types/Movimiento";
import type { Categoria } from "../types/Categoria";
import type { Tarjeta } from "../types/Tarjeta";
import {
  fetchCategoriasByUsuario,
  createCategoria,
} from "../services/categoriasService";
import {
  fetchTarjetasByUsuario,
  createTarjeta,
} from "../services/tarjetasService";
import "./FormMovimiento.css";

interface FormMovimientoProps {
  tipoInicial: "ingreso" | "gasto";
  movimientoInicial?: Movimiento;
  onSubmit: (
    mov: Omit<Movimiento, "idMovimiento" | "creadoEn" | "actualizadoEn">
  ) => Promise<void>;
  onCancel: () => void;
}

const FormMovimiento: React.FC<FormMovimientoProps> = ({
  tipoInicial,
  movimientoInicial,
  onSubmit,
  onCancel,
}) => {
  const idUsuario = localStorage.getItem("idUsuario") || "";
  const [tipo, setTipo] = useState<"ingreso" | "gasto">(
    movimientoInicial?.tipo || tipoInicial
  );
  const [monto, setMonto] = useState<number>(movimientoInicial?.monto || 0);
  const [fecha, setFecha] = useState<string>(
    movimientoInicial?.fecha.substring(0, 10) ||
      new Date().toISOString().substring(0, 10)
  );
  const [idCategoria, setIdCategoria] = useState<string>(
    movimientoInicial?.idCategoria || ""
  );
  const [idTarjeta, setIdTarjeta] = useState<string>(
    movimientoInicial?.idTarjeta || ""
  );
  const [descripcion, setDescripcion] = useState<string>(
    movimientoInicial?.descripcion || ""
  );

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [tarjetas, setTarjetas] = useState<Tarjeta[]>([]);
  const [error, setError] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Estado de mini-modales
  const [showCatModal, setShowCatModal] = useState<boolean>(false);
  const [newCatNombre, setNewCatNombre] = useState<string>("");

  const [showTarModal, setShowTarModal] = useState<boolean>(false);
  const [newTarNombre, setNewTarNombre] = useState<string>("");
  const [newTarLimite, setNewTarLimite] = useState<number>(0);
  const [newTarFechaCorte, setNewTarFechaCorte] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );

  // Carga de categorías y tarjetas al montar y al cambiar tipo
  useEffect(() => {
    const cargar = async () => {
      if (!idUsuario) return;
      const cats = await fetchCategoriasByUsuario(idUsuario, tipo);
      setCategorias(cats);
      if (tipo === "gasto") {
        const tds = await fetchTarjetasByUsuario(idUsuario);
        setTarjetas(tds);
      } else {
        setTarjetas([]);
        setIdTarjeta("");
      }
    };
    cargar();
  }, [idUsuario, tipo]);

  // Envío del formulario principal
  const handleSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (submitting) return;
    setError("");
    if (monto <= 0) return setError("El monto debe ser mayor a cero.");
    if (!idCategoria) return setError("Selecciona una categoría.");

    try {
      setSubmitting(true);
      await onSubmit({
        idUsuario,
        tipo,
        monto,
        fecha: new Date(fecha).toISOString(),
        idCategoria,
        idTarjeta: idTarjeta || undefined, // opcional
        descripcion: descripcion.trim() || undefined,
      });
    } catch (err) {
      console.error("Error en onSubmit:", err);
      setError("Ocurrió un error al guardar. Revisa la consola.");
    } finally {
      setSubmitting(false);
    }
  };

  // Creación de nueva categoría dentro del mini-modal
  const handleCreateCategoria = async (e: FormEvent) => {
    e.preventDefault();
    const nombre = newCatNombre.trim();
    if (!nombre) return;
    try {
      const newId = await createCategoria({ idUsuario, nombre, tipo });
      const cats = await fetchCategoriasByUsuario(idUsuario, tipo);
      setCategorias(cats);
      setIdCategoria(newId);
      setNewCatNombre("");
      setShowCatModal(false);
    } catch (err) {
      console.error("Error creando categoría:", err);
    }
  };

  // Creación de nueva tarjeta dentro del mini-modal
  const handleCreateTarjeta = async (e: FormEvent) => {
    e.preventDefault();
    const nombre = newTarNombre.trim();
    if (!nombre || newTarLimite <= 0) return;
    try {
      const newId = await createTarjeta({
        idUsuario,
        nombreTarjeta: nombre,
        limite: newTarLimite,
        fechaCorte: new Date(newTarFechaCorte).toISOString(),
        activo: true,
      });
      const tds = await fetchTarjetasByUsuario(idUsuario);
      setTarjetas(tds);
      setIdTarjeta(newId);
      setNewTarNombre("");
      setNewTarLimite(0);
      setNewTarFechaCorte(new Date().toISOString().substring(0, 10));
      setShowTarModal(false);
    } catch (err) {
      console.error("Error creando tarjeta:", err);
    }
  };

  return (
    <>
      <form className="form-movimiento" onSubmit={(e) => handleSubmit(e)}>
        <h3 className="form-title">
          {movimientoInicial ? "Editar Movimiento" : `Agregar ${tipo === "ingreso" ? "Ingreso" : "Gasto"}`}
        </h3>

        {/* Tipo */}
        <div className="form-group">
          <label className="form-label">Tipo</label>
          <select
            className="form-select"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as any)}
          >
            <option value="ingreso">Ingreso</option>
            <option value="gasto">Gasto</option>
          </select>
        </div>

        {/* Monto */}
        <div className="form-group">
          <label className="form-label">Monto</label>
          <input
            type="number"
            className="form-input"
            value={monto}
            onChange={(e) => setMonto(+e.target.value)}
            min={0.01}
            step={0.01}
            required
          />
        </div>

        {/* Fecha */}
        <div className="form-group">
          <label className="form-label">Fecha</label>
          <input
            type="date"
            className="form-input"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
          />
        </div>

        {/* Categoría + mini-modal */}
        <div className="form-group-inline">
          <div style={{ flex: 1 }}>
            <label className="form-label">Categoría</label>
            <select
              className="form-select"
              value={idCategoria}
              onChange={(e) => setIdCategoria(e.target.value)}
              required
            >
              <option value="">-- Selecciona --</option>
              {categorias.map((c) => (
                <option key={c.idCategoria} value={c.idCategoria}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className="btn-small-add"
            onClick={() => setShowCatModal(true)}
          >
            + Categoria
          </button>
        </div>

        {/* Tarjeta (solo gasto), opcional */}
        {tipo === "gasto" && (
          <div className="form-group-inline">
            <div style={{ flex: 1 }}>
              <label className="form-label">Tarjeta</label>
              <select
                className="form-select"
                value={idTarjeta}
                onChange={(e) => setIdTarjeta(e.target.value)}
              >
                <option value="">-- Opcional --</option>
                {tarjetas.map((t) => (
                  <option key={t.idTarjeta} value={t.idTarjeta}>
                    {t.nombreTarjeta}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              className="btn-small-add"
              onClick={() => setShowTarModal(true)}
            >
              + Tarjeta
            </button>
          </div>
        )}

        {/* Descripción */}
        <div className="form-group">
          <label className="form-label">Descripción (opcional)</label>
          <textarea
            className="form-textarea"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>

        {error && <div className="error-message-form">{error}</div>}

        {/* Botones */}
        <div className="form-buttons">
          <button
            type="button"
            className="btn-cancel"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn-submit"
            onClick={() => handleSubmit()}
            disabled={submitting}
          >
            {submitting ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>

      {/* Mini-modal Categoría */}
      {showCatModal && (
        <div
          className="mini-modal-overlay"
          onClick={() => setShowCatModal(false)}
        >
          <div
            className="mini-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h4>Nueva Categoría</h4>
            <form onSubmit={handleCreateCategoria}>
              <input
                type="text"
                className="form-input"
                placeholder="Nombre categoría"
                value={newCatNombre}
                onChange={(e) => setNewCatNombre(e.target.value)}
                required
              />
              <div className="mini-buttons">
                <button type="submit" className="btn-mini-submit">
                  Guardar
                </button>
                <button
                  type="button"
                  className="btn-mini-cancel"
                  onClick={() => setShowCatModal(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mini-modal Tarjeta */}
      {showTarModal && (
        <div
          className="mini-modal-overlay"
          onClick={() => setShowTarModal(false)}
        >
          <div
            className="mini-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h4>Nueva Tarjeta</h4>
            <form onSubmit={handleCreateTarjeta}>
              <input
                type="text"
                className="form-input"
                placeholder="Nombre tarjeta"
                value={newTarNombre}
                onChange={(e) => setNewTarNombre(e.target.value)}
                required
              />
              <input
                type="number"
                className="form-input"
                placeholder="Límite"
                value={newTarLimite}
                onChange={(e) => setNewTarLimite(+e.target.value)}
                min={1}
                required
              />
              <label className="form-label">Fecha de Corte</label>
              <input
                type="date"
                className="form-input"
                value={newTarFechaCorte}
                onChange={(e) => setNewTarFechaCorte(e.target.value)}
                required
              />
              <div className="mini-buttons">
                <button type="submit" className="btn-mini-submit">
                  Guardar
                </button>
                <button
                  type="button"
                  className="btn-mini-cancel"
                  onClick={() => setShowTarModal(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default FormMovimiento;
