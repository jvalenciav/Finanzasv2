// src/pages/ReportesPage.tsx

import React, { useState, useEffect } from "react";
import type { Movimiento } from "../types/Movimiento";
import { fetchMovimientosByUsuario } from "../services/movimientosService";
import { fetchCategoriasByUsuario } from "../services/categoriasService";
import { fetchTarjetasByUsuario } from "../services/tarjetasService";

import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "./ReportesPage.css";

// Formateador de moneda
const currencyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
});

const ReportesPage: React.FC = () => {
  const idUsuario = localStorage.getItem("idUsuario") || "";
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [catMap, setCatMap] = useState<Record<string, string>>({});
  const [tarMap, setTarMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const load = async () => {
      if (!idUsuario) return;
      const [movs, cats, tars] = await Promise.all([
        fetchMovimientosByUsuario(idUsuario),
        fetchCategoriasByUsuario(idUsuario),
        fetchTarjetasByUsuario(idUsuario),
      ]);
      setMovimientos(movs);
      const cm: Record<string, string> = {};
      cats.forEach((c) => {
        cm[c.idCategoria] = c.nombre;
      });
      setCatMap(cm);
      const tm: Record<string, string> = {};
      tars.forEach((t) => {
        tm[t.idTarjeta] = t.nombreTarjeta;
      });
      setTarMap(tm);
    };
    load();
  }, [idUsuario]);

  // Ingresos
  const ingresos = movimientos.filter((m) => m.tipo === "ingreso");
  const totalIngresos = ingresos.reduce((sum, m) => sum + m.monto, 0);
  const ingresosPorCategoria = ingresos.reduce<Record<string, number>>((acc, m) => {
    acc[m.idCategoria] = (acc[m.idCategoria] || 0) + m.monto;
    return acc;
  }, {});

  // Gastos
  const gastos = movimientos.filter((m) => m.tipo === "gasto");
  const totalGastos = gastos.reduce((sum, m) => sum + m.monto, 0);
  const gastosPorCategoria = gastos.reduce<Record<string, number>>((acc, m) => {
    acc[m.idCategoria] = (acc[m.idCategoria] || 0) + m.monto;
    return acc;
  }, {});
  const gastosPorTarjeta = gastos.reduce<Record<string, number>>((acc, m) => {
    if (m.idTarjeta) {
      acc[m.idTarjeta] = (acc[m.idTarjeta] || 0) + m.monto;
    }
    return acc;
  }, {});
  const gastosPorMes = gastos.reduce<Record<string, number>>((acc, m) => {
    const d = new Date(m.fecha);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    acc[key] = (acc[key] || 0) + m.monto;
    return acc;
  }, {});

  return (
    <div className="reportes-layout">
      <Header />
      <div className="content-area">
        <Sidebar />
        <main className="reportes-main">
          <h2>Reportes Financieros</h2>

          <section className="report-section">
            <h3>Ingresos</h3>
            <p>
              <strong>Total general:</strong>{" "}
              {currencyFormatter.format(totalIngresos)}
            </p>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(ingresosPorCategoria).map(([catId, mont]) => (
                  <tr key={catId}>
                    <td>{catMap[catId] || catId}</td>
                    <td>{currencyFormatter.format(mont)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="report-section">
            <h3>Gastos</h3>
            <p>
              <strong>Total general:</strong>{" "}
              {currencyFormatter.format(totalGastos)}
            </p>

            <h4>Por Categoría</h4>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(gastosPorCategoria).map(([catId, mont]) => (
                  <tr key={catId}>
                    <td>{catMap[catId] || catId}</td>
                    <td>{currencyFormatter.format(mont)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h4>Por Tarjeta</h4>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Tarjeta</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(gastosPorTarjeta).map(([tarId, mont]) => (
                  <tr key={tarId}>
                    <td>{tarMap[tarId] || tarId}</td>
                    <td>{currencyFormatter.format(mont)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h4>Por Mes</h4>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Mes</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(gastosPorMes).map(([mes, mont]) => (
                  <tr key={mes}>
                    <td>{mes}</td>
                    <td>{currencyFormatter.format(mont)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </main>
      </div>
    </div>
  );
};

export default ReportesPage;
