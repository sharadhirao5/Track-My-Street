import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ReportDamage from "./pages/ReportDamage";
import ComplaintTracking from "./pages/ComplaintTracking";
import MyComplaints from "./pages/MyComplaints";
import ViewComplaint from "./pages/ViewComplaint";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route path="/dashboard" element={<Dashboard />} />

      <Route path="/report" element={<ReportDamage />} />

      <Route
        path="/complaints"
        element={<MyComplaints />}
      />

      <Route
        path="/view-complaint"
        element={<ViewComplaint />}
      />

      <Route
        path="/complaint-tracking"
        element={<ComplaintTracking />}
      />

      <Route
        path="/profile"
        element={<Profile />}
      />

      <Route
        path="/notifications"
        element={<Notifications />}
      />
    </Routes>
  );
}

export default App;