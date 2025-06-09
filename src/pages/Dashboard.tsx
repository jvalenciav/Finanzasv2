// src/pages/Dashboard.tsx

import React, { useState, useEffect } from "react";
import type { Movimiento } from "../types/Movimiento";
import type { Categoria } from "../types/Categoria";
import type { Tarjeta } from "../types/Tarjeta";

import { fetchMovimientosByUsuario } from "../services/movimientosService";
import { fetchCategoriasByUsuario } from "../services/categoriasService";
import { fetchTarjetasByUsuario } from "../services/tarjetasService";

import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import FiltersDashboard from "../components/FiltersDashboard";
import KpiCard from "../components/KpiCard";
import ChartsDashboard from "../components/ChartsDashboard";

import "./Dashboard.css";

// Formateador de moneda
const currencyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
});

// Fechas por defecto: desde inicio de año hasta hoy
const now = new Date();
const startOfYear = `${now.getFullYear()}-01-01`;
const today = now.toISOString().substring(0, 10);

const Dashboard: React.FC = () => {
  const idUsuario = localStorage.getItem("idUsuario") || "";

  const [movs, setMovs] = useState<Movimiento[]>([]);
  const [cats, setCats] = useState<Categoria[]>([]);
  const [tars, setTars] = useState<Tarjeta[]>([]);

  const [filters, setFilters] = useState({
    start: startOfYear,
    end: today,
    selectedTipos: [] as string[],
    selectedCats: [] as string[],
    selectedTars: [] as string[],
  });

  const [catMap, setCatMap] = useState<Record<string, string>>({});
  const [tarMap, setTarMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const load = async () => {
      if (!idUsuario) return;
      const [allMovs, allCats, allTars] = await Promise.all([
        fetchMovimientosByUsuario(idUsuario),
        fetchCategoriasByUsuario(idUsuario),
        fetchTarjetasByUsuario(idUsuario),
      ]);
      setMovs(allMovs);
      setCats(allCats);
      setTars(allTars);

      const cm: Record<string, string> = {};
      allCats.forEach((c) => {
        cm[c.idCategoria] = c.nombre;
      });
      setCatMap(cm);

      const tm: Record<string, string> = {};
      allTars.forEach((t) => {
        tm[t.idTarjeta] = t.nombreTarjeta;
      });
      setTarMap(tm);
    };
    load();
  }, [idUsuario]);

  // Aplicar filtros
  const filtered = movs.filter((m) => {
    const d = m.fecha.substring(0, 10);
    if (d < filters.start || d > filters.end) return false;
    if (
      filters.selectedTipos.length > 0 &&
      !filters.selectedTipos.includes(m.tipo)
    )
      return false;
    if (
      filters.selectedCats.length > 0 &&
      !filters.selectedCats.includes(m.idCategoria)
    )
      return false;
    if (
      filters.selectedTars.length > 0 &&
      (!m.idTarjeta || !filters.selectedTars.includes(m.idTarjeta))
    )
      return false;
    return true;
  });

  const ingresos = filtered.filter((m) => m.tipo === "ingreso");
  const gastos = filtered.filter((m) => m.tipo === "gasto");
  const totalIngresos = ingresos.reduce((sum, m) => sum + m.monto, 0);
  const totalGastos = gastos.reduce((sum, m) => sum + m.monto, 0);
  const balance = totalIngresos - totalGastos;
  const countMovs = filtered.length;
  const avgGasto = gastos.length ? totalGastos / gastos.length : 0;

  return (
    <div className="dashboard-layout">
      <Header />
      <div className="content-area">
        <Sidebar />
        <main className="dashboard-main">
          <h2>Dashboard</h2>

          <FiltersDashboard
            start={filters.start}
            end={filters.end}
            selectedTipos={filters.selectedTipos}
            cats={cats}
            tars={tars}
            selectedCats={filters.selectedCats}
            selectedTars={filters.selectedTars}
            onChange={(newF) => setFilters((prev) => ({ ...prev, ...newF }))}
          />

          <div className="kpi-grid">
            <KpiCard
              title="Total Ingresos"
              value={currencyFormatter.format(totalIngresos)}
            />
            <KpiCard
              title="Total Gastos"
              value={currencyFormatter.format(totalGastos)}
            />
            <KpiCard
              title="Dinero al día de hoy"
              value={currencyFormatter.format(balance)}
            />
            <KpiCard title="Mov. Filtrados" value={countMovs} />
            <KpiCard
              title="Gasto Promedio"
              value={currencyFormatter.format(avgGasto)}
            />
          </div>

          <ChartsDashboard
            ingresos={ingresos}
            gastos={gastos}
            catMap={catMap}
            tarMap={tarMap}
          />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
