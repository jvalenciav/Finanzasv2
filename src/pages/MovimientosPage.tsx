import React, { useState, useEffect } from "react";
import type { Movimiento } from "../types/Movimiento";
import type { Categoria } from "../types/Categoria";
import type { Tarjeta } from "../types/Tarjeta";

import {
  fetchMovimientosByUsuario,
  createMovimiento,
  updateMovimiento,
  deleteMovimiento,
} from "../services/movimientosService";
import { fetchCategoriasByUsuario } from "../services/categoriasService";
import { fetchTarjetasByUsuario } from "../services/tarjetasService";

import FormMovimiento from "../components/FormMovimiento";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "./MovimientosPage.css";

const MovimientosPage: React.FC = () => {
  const idUsuario = localStorage.getItem("idUsuario") || "";
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [tarjetas, setTarjetas] = useState<Tarjeta[]>([]);

  const [showForm, setShowForm] = useState<boolean>(false);
  const [modoEdicion, setModoEdicion] = useState<Movimiento | null>(null);

  // Para el confirm dialog
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  const [mapCategorias, setMapCategorias] = useState<Record<string, string>>({});
  const [mapTarjetas, setMapTarjetas] = useState<Record<string, string>>({});

  // Carga inicial
  const cargarDatosIniciales = async () => {
    if (!idUsuario) return;
    const [movs, cats, tars] = await Promise.all([
      fetchMovimientosByUsuario(idUsuario),
      fetchCategoriasByUsuario(idUsuario),
      fetchTarjetasByUsuario(idUsuario),
    ]);
    movs.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    setMovimientos(movs);
    setCategorias(cats);
    setTarjetas(tars);

    const catMap: Record<string, string> = {};
    cats.forEach((c) => (catMap[c.idCategoria] = c.nombre));
    setMapCategorias(catMap);

    const tarMap: Record<string, string> = {};
    tars.forEach((t) => (tarMap[t.idTarjeta] = t.nombreTarjeta));
    setMapTarjetas(tarMap);
  };

  useEffect(() => {
    cargarDatosIniciales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAgregarClick = () => {
    setModoEdicion(null);
    setShowForm(true);
  };

  const handleEditar = (mov: Movimiento) => {
    setModoEdicion(mov);
    setShowForm(true);
  };

  // Ahora sólo abre el dialog
  const handleEliminar = (idMov: string) => {
    setConfirmDeleteId(idMov);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    setDeleting(true);
    try {
      await deleteMovimiento(confirmDeleteId);
      await cargarDatosIniciales();
    } finally {
      setDeleting(false);
      setConfirmDeleteId(null);
    }
  };

  const handleSubmitForm = async (
    movData: Omit<Movimiento, "idMovimiento" | "creadoEn" | "actualizadoEn">
  ) => {
    if (modoEdicion) {
      await updateMovimiento(modoEdicion.idMovimiento, movData);
    } else {
      await createMovimiento(movData);
    }
    setShowForm(false);
    setModoEdicion(null);
    await cargarDatosIniciales();
  };

  return (
    <div className="movimientos-layout">
      <Header />
      <div className="content-area">
        <Sidebar />
        <main className="movimientos-main">
          <div className="movimientos-header">
            <h2>Movimientos</h2>
            <button className="btn-add" onClick={handleAgregarClick}>
              + Agregar Movimiento
            </button>
          </div>

          {/* Formulario en modal */}
          {showForm && (
            <div className="modal-overlay" onClick={() => setShowForm(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <FormMovimiento
                  tipoInicial={modoEdicion?.tipo || "gasto"}
                  movimientoInicial={modoEdicion || undefined}
                  onSubmit={handleSubmitForm}
                  onCancel={() => setShowForm(false)}
                />
              </div>
            </div>
          )}

          {/* Confirmación de eliminación */}
          {confirmDeleteId && (
            <div className="confirm-overlay">
              <div className="confirm-content">
                <p>¿Estás seguro de eliminar este movimiento?</p>
                <div className="confirm-buttons">
                  <button
                    className="btn-delete"
                    onClick={confirmDelete}
                    disabled={deleting}
                  >
                    {deleting ? "Eliminando..." : "Eliminar"}
                  </button>
                  <button
                    className="btn-cancel"
                    onClick={() => setConfirmDeleteId(null)}
                    disabled={deleting}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          <table className="movimientos-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Monto</th>
                <th>Categoría</th>
                <th>Tarjeta</th>
                <th>Descripción</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "1rem" }}>
                    No hay movimientos.
                  </td>
                </tr>
              ) : (
                movimientos.map((mov) => (
                  <tr key={mov.idMovimiento}>
                    <td>{new Date(mov.fecha).toLocaleDateString()}</td>
                    <td>{mov.tipo === "ingreso" ? "Ingreso" : "Gasto"}</td>
                    <td>${mov.monto.toFixed(2)}</td>
                    <td>{mapCategorias[mov.idCategoria] || "-"}</td>
                    <td>{mov.idTarjeta ? mapTarjetas[mov.idTarjeta] || "-" : "-"}</td>
                    <td>{mov.descripcion || "-"}</td>
                    <td>
                      <button
                        className="btn-edit"
                        onClick={() => handleEditar(mov)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleEliminar(mov.idMovimiento)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </main>
      </div>
    </div>
  );
};

export default MovimientosPage;
