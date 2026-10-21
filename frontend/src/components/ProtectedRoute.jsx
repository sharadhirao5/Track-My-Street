import React from "react";
import { Navigate, useLocation } from "react-router-dom";

function getStoredUser() {
  try {
    const value = localStorage.getItem("user");
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function getHomeForRole(role) {
  switch (role) {
    case "admin":
      return "/admin";
    case "authority":
      return "/authority";
    case "citizen":
      return "/dashboard";
    default:
      return "/login";
  }
}

function ProtectedRoute({ allowedRole, children }) {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const user = getStoredUser();

  if (!token || !user || !user.role) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={getHomeForRole(user.role)} replace />;
  }

  return children;
}

export default ProtectedRoute;