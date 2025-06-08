// src/components/Sidebar.tsx
import React from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const Sidebar: React.FC = () => {
  return (
    <aside className="app-sidebar">
      <nav>
        <ul>
          <li>
            <NavLink to="/" className={({ isActive }) => isActive ? "active" : ""}>
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/movimientos" className={({ isActive }) => isActive ? "active" : ""}>
              Movimientos
            </NavLink>
          </li>
          <li>
            <NavLink to="/categorias" className={({ isActive }) => isActive ? "active" : ""}>
              Categorías
            </NavLink>
          </li>
          <li>
            <NavLink to="/tarjetas" className={({ isActive }) => isActive ? "active" : ""}>
              Tarjetas
            </NavLink>
          </li>
          <li>
            <NavLink to="/reportes" className={({ isActive }) => isActive ? "active" : ""}>
              Reportes
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
