import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Login from "../pages/auth/Login";
import AdminLayout from "../layouts/AdminLayout";
import Dashboard from "../pages/admin/Dashboard";
import Employees from "../pages/admin/Employees";
import EmployeeProfile from "../pages/employees/profile";
import Users from "../pages/admin/Users";
import Managers from "../pages/admin/Managers";
import Teams from "../pages/admin/Teams";
import Projects from "../pages/admin/Projects";
import ProjectDetail from "../pages/admin/ProjectDetail";
import Contributions from "../pages/admin/Contributions";
import Attendance from "../pages/admin/Attendance";
import EmployeeAttendanceCalendar from "../pages/admin/EmployeeAttendanceCalendar";
import Leave from "../pages/admin/Leave";
import Reports from "../pages/admin/Reports";
import Settings from "../pages/admin/Settings";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "../context/AuthContext";

// Admins land on the full Dashboard; managers/employees don't have access to
// it yet (it's built on modules — Projects, Attendance, Leave — that aren't
// wired to the backend for their roles), so they land on Teams instead.
const AdminHomeRedirect = () => {
  const { user } = useAuth();
  return <Navigate to={user?.role === "admin" ? "dashboard" : "teams"} replace />;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Signed-in (any role) */}
        <Route element={<ProtectedRoute allowedRoles={["admin", "manager", "employee"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminHomeRedirect />} />

            {/* Read-only for every role; write actions are hidden/blocked
                for non-admins inside the page itself and enforced server-side. */}
            <Route path="teams" element={<Teams />} />

            {/* Admin-only modules */}
            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="employees" element={<Employees />} />
              <Route path="employees/:employeeId" element={<EmployeeProfile />} />
              <Route path="users" element={<Users />} />
              <Route path="managers" element={<Managers />} />
              <Route path="projects" element={<Projects />} />
              <Route path="projects/contributions" element={<Contributions />} />
              <Route path="projects/:projectId" element={<ProjectDetail />} />
              <Route path="attendance" element={<Attendance />} />
              <Route
                path="attendance/:employeeId"
                element={<EmployeeAttendanceCalendar />}
              />
              <Route path="leave" element={<Leave />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>
        </Route>

        {/* Default */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* 404 */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
