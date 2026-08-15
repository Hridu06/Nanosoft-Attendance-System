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

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Admin (protected) */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route
              index
              element={<Navigate to="dashboard" replace />}
            />

            <Route path="dashboard" element={<Dashboard />} />
            <Route path="employees" element={<Employees />} />
            <Route path="employees/:employeeId" element={<EmployeeProfile />} />
            <Route path="managers" element={<Managers />} />
            <Route path="teams" element={<Teams />} />
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
