import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCog,
  FolderKanban,
  Clock3,
  CalendarDays,
  BarChart3,
  Settings,
  ListChecks,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/Nanosoft.png";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  sub?: NavItem[];
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Management",
    items: [
      { to: "/admin/employees", label: "Employees", icon: Users },
      { to: "/admin/managers", label: "Managers", icon: UserCog },
      {
        to: "/admin/projects",
        label: "Projects",
        icon: FolderKanban,
        sub: [
          {
            to: "/admin/projects/contributions",
            label: "Contributions",
            icon: ListChecks,
          },
        ],
      },
    ],
  },
  {
    label: "Operations",
    items: [
      { to: "/admin/attendance", label: "Attendance", icon: Clock3 },
      { to: "/admin/leave", label: "Leave", icon: CalendarDays },
      { to: "/admin/reports", label: "Reports", icon: BarChart3 },
    ],
  },
  {
    label: "System",
    items: [{ to: "/admin/settings", label: "Settings", icon: Settings }],
  },
];

const AdminSidebar = () => {
  const { user } = useAuth();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-slate-200 bg-white shadow-[2px_0_12px_-4px_rgba(15,23,42,0.06)]">
      {/* Logo */}
      <div className="flex h-20 shrink-0 items-center border-b border-slate-100 px-5">
        <img
          src={logo}
          alt="Nanosoft"
          className="h-16 w-auto object-contain"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {group.label}
            </p>

            <div className="space-y-0.5">
              {group.items.map(({ to, label, icon: Icon, sub }) => (
                <div key={to}>
                  <NavLink
                    to={to}
                    end={Boolean(sub)}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 rounded-lg border-l-2 px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`
                    }
                  >
                    <Icon size={17} className="shrink-0" />
                    <span>{label}</span>
                  </NavLink>

                  {sub && (
                    <div className="mt-0.5 space-y-0.5">
                      {sub.map((subItem) => (
                        <NavLink
                          key={subItem.to}
                          to={subItem.to}
                          className={({ isActive }) =>
                            `flex items-center gap-2.5 rounded-lg border-l-2 py-1.5 pl-9 pr-3 text-[13px] font-medium transition-colors ${
                              isActive
                                ? "border-blue-600 bg-blue-50 text-blue-700"
                                : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                            }`
                          }
                        >
                          <subItem.icon size={15} className="shrink-0" />
                          <span>{subItem.label}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="shrink-0 border-t border-slate-100 px-4 py-4">
        <div className="flex items-center gap-3 rounded-lg px-2 py-1.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
            {(user?.name || "A").charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-800">
              {user?.name || "Admin"}
            </p>
            <p className="truncate text-xs capitalize text-slate-500">
              {user?.role || "admin"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
