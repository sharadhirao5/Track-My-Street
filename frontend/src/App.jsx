import { Navigate, Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ReportDamage from "./pages/ReportDamage";
import MyComplaints from "./pages/MyComplaints";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import AuthorityDashboard from "./pages/AuthorityDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Public pages */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Administrator pages */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Authority pages */}
      <Route
        path="/authority"
        element={
          <ProtectedRoute allowedRole="authority">
            <AuthorityDashboard />
          </ProtectedRoute>
        }
      />

      {/* Citizen pages */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRole="citizen">
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/report"
        element={
          <ProtectedRoute allowedRole="citizen">
            <ReportDamage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/complaints"
        element={
          <ProtectedRoute allowedRole="citizen">
            <MyComplaints />
          </ProtectedRoute>
        }
      />

      <Route
        path="/notifications"
        element={
          <ProtectedRoute allowedRole="citizen">
            <Notifications />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRole="citizen">
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
