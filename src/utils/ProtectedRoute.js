// ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
      if (role === "CEO") {
        return <Navigate to="/ceo-signin" />;
      }
      return <Navigate to="/signin" />;
    }

  return children;
};

export default ProtectedRoute;
