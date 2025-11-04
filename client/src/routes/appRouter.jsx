import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../auth/protectedRoute";

import Register from "../pages/passport/register";
import Login from "../pages/passport/login";
import DonorDashboard from "../pages/dashboards/donor/donorDashboard";
import StaffDashboard from "../pages/dashboards/staff/staffDashboard";
import AdminDashboard from "../pages/dashboards/admin/adminDashboard";
import Landing from "../pages/landing";
import Verify2FA from "../pages/verifyTwoFactor";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Landing />} />
      <Route path="/verifyTwoFactors" element={<Verify2FA />} />

      <Route
        path="/donor/*"
        element={
          <ProtectedRoute allowedRoles={["Donor"]}>
            <DonorDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/staff/*"
        element={
          <ProtectedRoute allowedRoles={["Staff"]}>
            <StaffDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}