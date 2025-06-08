// src/components/Header.tsx

import React from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const nombreUsuario = localStorage.getItem("nombreUsuario") || "";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <span className="project-title">Finanzas V²</span>
        {nombreUsuario && (
          <span className="header-welcome">
          <strong>
             Bienvenido {nombreUsuario}
             </strong>
          </span>
        )}
      </div>
      <button className="header-logout" onClick={handleLogout}>
        Cerrar Sesión
      </button>
    </header>
  );
};

export default Header;
