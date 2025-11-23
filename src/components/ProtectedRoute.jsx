// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useAuth();

  // Se não tiver logado → manda pro login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se for rota de admin e não for admin → manda pra home
  if (adminOnly && user.perfil !== "Administrador") {
    return <Navigate to="/" replace />;
  }

  return children;
}
