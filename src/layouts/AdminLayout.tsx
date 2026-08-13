import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/layout/AdminSidebar";
import Topbar from "../components/layout/Topbar";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell min-h-screen bg-slate-100">
      {/* Sidebar */}
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Area */}
      <div className="md:ml-64">
        {/* Topbar */}
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Page Content */}
        <main className="pt-20">
          <div className="p-4 sm:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;