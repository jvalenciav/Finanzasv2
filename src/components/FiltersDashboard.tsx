// src/components/FiltersDashboard.tsx

import React, { useEffect } from "react";
import type { Categoria } from "../types/Categoria";
import type { Tarjeta } from "../types/Tarjeta";
import "./FiltersDashboard.css";

interface FiltersProps {
  start: string;
  end: string;
  selectedTipos: string[];
  cats: Categoria[];
  tars: Tarjeta[];
  selectedCats: string[];
  selectedTars: string[];
  onChange: (filters: {
    start: string;
    end: string;
    selectedTipos: string[];
    selectedCats: string[];
    selectedTars: string[];
  }) => void;
}

// Helper que devuelve la fecha de hoy en formato YYYY-MM-DD
const getTodayISO = (): string => {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
};

const tipoOptions = [
  { value: "ingreso", label: "Ingreso" },
  { value: "gasto", label: "Gasto" },
];

const FiltersDashboard: React.FC<FiltersProps> = ({
  start,
  end,
  selectedTipos,
  cats,
  tars,
  selectedCats,
  selectedTars,
  onChange,
}) => {
  // Al montar, si 'end' está vacío o no es hoy, lo inicializamos a hoy
  useEffect(() => {
    const today = getTodayISO();
    if (end !== today) {
      onChange({ start, end: today, selectedTipos, selectedCats, selectedTars });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDate =
    (field: "start" | "end") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange({
        start,
        end,
        selectedTipos,
        selectedCats,
        selectedTars,
        [field]: e.target.value,
      } as any);
    };

  const handleMulti =
    (field: "selectedTipos" | "selectedCats" | "selectedTars") =>
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      let vals = Array.from(e.target.selectedOptions).map((o) => o.value);
      // si se incluye la opción "Todos" (valor = ""), limpiamos
      if (vals.includes("")) {
        vals = [];
      }
      onChange({
        start,
        end,
        selectedTipos,
        selectedCats,
        selectedTars,
        [field]: vals,
      } as any);
    };

  return (
    <div className="filters-dashboard">
      <div className="filter-group">
        <label>Desde:</label>
        <input type="date" value={start} onChange={handleDate("start")} />
      </div>

      <div className="filter-group">
        <label>Hasta:</label>
        <input
          type="date"
          value={end || getTodayISO()}
          onChange={handleDate("end")}
        />
      </div>

      <div className="filter-group">
        <label>Tipo de Movimiento:</label>
        <select
          multiple
          value={selectedTipos}
          onChange={handleMulti("selectedTipos")}
        >
          <option value="">Todos</option>
          {tipoOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Categorías:</label>
        <select
          multiple
          value={selectedCats}
          onChange={handleMulti("selectedCats")}
        >
          <option value="">Todos</option>
          {cats.map((c) => (
            <option key={c.idCategoria} value={c.idCategoria}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Tarjetas:</label>
        <select
          multiple
          value={selectedTars}
          onChange={handleMulti("selectedTars")}
        >
          <option value="">Todos</option>
          {tars.map((t) => (
            <option key={t.idTarjeta} value={t.idTarjeta}>
              {t.nombreTarjeta}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FiltersDashboard;
