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

  // No login information: ask the user to register first.
  if (!token || !user || !user.role) {
    return (
      <Navigate
        to="/register"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  // Prevent users from opening another role's dashboard.
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={getHomeForRole(user.role)} replace />;
  }

  return children;
}

export default ProtectedRoute;