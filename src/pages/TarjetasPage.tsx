// src/pages/TarjetasPage.tsx

import React, { useState, useEffect } from "react";
import type { Tarjeta } from "../types/Tarjeta";

import {
  fetchTarjetasByUsuario,
  createTarjeta,
  updateTarjeta,
  deleteTarjeta,
} from "../services/tarjetasService";

import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import FormTarjeta from "../components/FormTarjeta";
import "./TarjetasPage.css";

const TarjetasPage: React.FC = () => {
  const idUsuario = localStorage.getItem("idUsuario") || "";
  const [tarjetas, setTarjetas] = useState<Tarjeta[]>([]);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [modoEdicion, setModoEdicion] = useState<Tarjeta | null>(null);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  const load = async () => {
    if (!idUsuario) return;
    setTarjetas(await fetchTarjetasByUsuario(idUsuario));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNew = () => {
    setModoEdicion(null);
    setShowForm(true);
  };

  const handleEdit = (t: Tarjeta) => {
    setModoEdicion(t);
    setShowForm(true);
  };

  const handleDeleteClick = (id: string) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    setDeleting(true);
    try {
      await deleteTarjeta(confirmDeleteId);
      await load();
    } finally {
      setDeleting(false);
      setConfirmDeleteId(null);
    }
  };

  const handleSubmitForm = async (data: Omit<Tarjeta, "idTarjeta">) => {
    if (modoEdicion) {
      await updateTarjeta(modoEdicion.idTarjeta, data);
    } else {
      await createTarjeta(data);
    }
    setShowForm(false);
    setModoEdicion(null);
    await load();
  };

  return (
    <div className="tarjetas-layout">
      <Header />
      <div className="content-area">
        <Sidebar />
        <main className="tarjetas-main">
          <div className="tarjetas-header">
            <h2>Tarjetas</h2>
            <button className="btn-add" onClick={handleNew}>
              + Nueva Tarjeta
            </button>
          </div>

          {showForm && (
            <div className="modal-overlay" onClick={() => setShowForm(false)}>
              <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <FormTarjeta
                  tarjetaInicial={modoEdicion || undefined}
                  onSubmit={handleSubmitForm}
                  onCancel={() => setShowForm(false)}
                />
              </div>
            </div>
          )}

          {confirmDeleteId && (
            <div
              className="confirm-overlay"
              onClick={() => setConfirmDeleteId(null)}
            >
              <div
                className="confirm-content"
                onClick={(e) => e.stopPropagation()}
              >
                <p>¿Eliminar esta tarjeta?</p>
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

          <table className="tarjetas-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Límite</th>
                <th>Fecha de Corte</th>
                <th>Activo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tarjetas.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "1rem" }}>
                    No hay tarjetas.
                  </td>
                </tr>
              ) : (
                tarjetas.map((t) => (
                  <tr key={t.idTarjeta}>
                    <td>{t.nombreTarjeta}</td>
                    <td>
                      {typeof t.limite === "number"
                        ? `$${t.limite.toFixed(2)}`
                        : "-"}
                    </td>
                    <td>
                      {t.fechaCorte
                        ? new Date(t.fechaCorte).toLocaleDateString()
                        : "-"}
                    </td>
                    <td>{t.activo ? "Sí" : "No"}</td>
                    <td>
                      <button className="btn-edit" onClick={() => handleEdit(t)}>
                        Editar
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteClick(t.idTarjeta)}
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

export default TarjetasPage;
