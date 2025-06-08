// src/pages/CategoriasPage.tsx

import React, { useState, useEffect } from "react";
import type { Categoria } from "../types/Categoria";

import {
  fetchCategoriasByUsuario,
  createCategoria,
  updateCategoria,
  deleteCategoria,
} from "../services/categoriasService";

import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import FormCategoria from "../components/FormCategoria";
import "./CategoriasPage.css";

const CategoriasPage: React.FC = () => {
  const idUsuario = localStorage.getItem("idUsuario") || "";
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [modoEdicion, setModoEdicion] = useState<Categoria | null>(null);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  const loadCategorias = async () => {
    if (!idUsuario) return;
    const cats = await fetchCategoriasByUsuario(idUsuario);
    setCategorias(cats);
  };

  useEffect(() => {
    loadCategorias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNew = () => {
    setModoEdicion(null);
    setShowForm(true);
  };

  const handleEdit = (cat: Categoria) => {
    setModoEdicion(cat);
    setShowForm(true);
  };

  const handleDeleteClick = (id: string) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    setDeleting(true);
    try {
      await deleteCategoria(confirmDeleteId);
      await loadCategorias();
    } finally {
      setDeleting(false);
      setConfirmDeleteId(null);
    }
  };

  const handleSubmitForm = async (data: Omit<Categoria, "idCategoria">) => {
    if (modoEdicion) {
      await updateCategoria(modoEdicion.idCategoria, {
        nombre: data.nombre,
        tipo: data.tipo,
      });
    } else {
      await createCategoria(data);
    }
    setShowForm(false);
    setModoEdicion(null);
    await loadCategorias();
  };

  return (
    <div className="categorias-layout">
      <Header />
      <div className="content-area">
        <Sidebar />
        <main className="categorias-main">
          <div className="categorias-header">
            <h2>Categorías</h2>
            <button className="btn-add" onClick={handleNew}>
              + Nueva Categoría
            </button>
          </div>

          {showForm && (
            <div className="modal-overlay" onClick={() => setShowForm(false)}>
              <div
                className="modal-content"
                onClick={e => e.stopPropagation()}
              >
                <FormCategoria
                  categoriaInicial={modoEdicion || undefined}
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
                onClick={e => e.stopPropagation()}
              >
                <p>¿Eliminar esta categoría?</p>
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

          <table className="categorias-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Nombre</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categorias.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: "center", padding: "1rem" }}>
                    No hay categorías.
                  </td>
                </tr>
              ) : (
                categorias.map(cat => (
                  <tr key={cat.idCategoria}>
                    <td>{cat.tipo === "ingreso" ? "Ingreso" : "Gasto"}</td>
                    <td>{cat.nombre}</td>
                    <td>
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(cat)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteClick(cat.idCategoria)}
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

export default CategoriasPage;
