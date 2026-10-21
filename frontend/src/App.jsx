
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ReportDamage from "./pages/ReportDamage";
import MyComplaints from "./pages/MyComplaints";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";

import ComplaintTracking from "./pages/ComplaintTracking";
import ViewComplaint from "./pages/ViewComplaint";
import AdminDashboard from "./pages/AdminDashboard";
import AuthorityDashboard from "./pages/AuthorityDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Citizen routes */}
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
          path="/complaint-tracking"
          element={
            <ProtectedRoute allowedRole="citizen">
              <ComplaintTracking />
            </ProtectedRoute>
          }
        />

        <Route
          path="/view-complaint"
          element={
            <ProtectedRoute allowedRole="citizen">
              <ViewComplaint />
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

        <Route
          path="/notifications"
          element={
            <ProtectedRoute allowedRole="citizen">
              <Notifications />
            </ProtectedRoute>
          }
        />

        {/* Admin route */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Authority route */}
        <Route
          path="/authority"
          element={
            <ProtectedRoute allowedRole="authority">
              <AuthorityDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
