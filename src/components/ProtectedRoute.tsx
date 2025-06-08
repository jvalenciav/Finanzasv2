// src/components/ProtectedRoute.tsx

import React from "react";
import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const idUsuario = localStorage.getItem("idUsuario");
  const location = useLocation();

  if (!idUsuario) {
    // No hay usuario en sesión, redirige a /login
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Usuario autenticado: renderiza el contenido protegido
  return <>{children}</>;
};

export default ProtectedRoute;
