import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Search,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  dashboard: {
    title: "Dashboard",
    subtitle: "Attendance Management",
  },
  employees: {
    title: "Employees",
    subtitle: "Manage employee records",
  },
  managers: {
    title: "Managers",
    subtitle: "Manage manager accounts",
  },
  projects: {
    title: "Projects",
    subtitle: "Manage projects and assignments",
  },
  attendance: {
    title: "Attendance",
    subtitle: "Project-based attendance tracking",
  },
  leave: {
    title: "Leave",
    subtitle: "Manage leave requests",
  },
  reports: {
    title: "Reports",
    subtitle: "Attendance and contribution reports",
  },
  settings: {
    title: "Settings",
    subtitle: "System and account preferences",
  },
};

const Topbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const currentSegment = location.pathname.split("/").pop() ?? "dashboard";
  const { title: pageTitle, subtitle: pageSubtitle } =
    pageTitles[currentSegment] ?? pageTitles.dashboard;

  const displayName = user?.name || "Admin";
  const displayRole = user?.role ?? "admin";

  return (
    <header className="fixed left-64 right-0 top-0 z-30 h-16 border-b border-slate-200 bg-white">
      <div className="flex h-full items-center justify-between px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile / Sidebar Toggle */}
          <button
            type="button"
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>

          {/* Page Title */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {pageTitle}
            </h2>

            <p className="text-xs text-slate-500">
              {pageSubtitle}
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <button
            type="button"
            className="rounded-lg p-2.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Search"
          >
            <Search size={20} />
          </button>

          {/* Notification */}
          <button
            type="button"
            className="relative rounded-lg p-2.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Notifications"
          >
            <Bell size={20} />

            {/* Notification Badge */}
            <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-red-500" />
          </button>

          {/* Divider */}
          <div className="mx-2 h-8 w-px bg-slate-200" />

          {/* Profile */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-50"
            >
              {/* Avatar */}
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                {displayName.charAt(0).toUpperCase()}
              </div>

              {/* User Info */}
              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold text-slate-800">
                  {displayName}
                </p>

                <p className="text-xs text-slate-500 capitalize">
                  {displayRole}
                </p>
              </div>

              <ChevronDown
                size={16}
                className="text-slate-400"
              />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-40 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
