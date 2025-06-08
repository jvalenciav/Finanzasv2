// src/components/FiltersDashboard.tsx

import React from "react";
import type { Categoria } from "../types/Categoria";
import type { Tarjeta } from "../types/Tarjeta";
import "./FiltersDashboard.css";

interface FiltersProps {
  start: string;
  end: string;
  selectedTipos: string[];         // array de tipos seleccionados
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

const tipoOptions = [
  { value: "ingreso", label: "Ingreso" },
  { value: "gasto",   label: "Gasto"   },
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
      let vals = Array.from(e.target.selectedOptions).map(o => o.value);
      // si se seleccionó "Todos" (value=""), limpio todas las selecciones
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
        <input type="date" value={end} onChange={handleDate("end")} />
      </div>

      <div className="filter-group">
        <label>Tipo de Movimiento:</label>
        <select
          multiple
          value={selectedTipos}
          onChange={handleMulti("selectedTipos")}
        >
          <option value="">Todos</option>
          {tipoOptions.map(opt => (
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
          {cats.map(c => (
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
          {tars.map(t => (
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
