import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/layout/AdminSidebar";
import Topbar from "../components/layout/Topbar";

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-slate-100">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Area */}
      <div className="ml-64">
        {/* Topbar */}
        <Topbar />

        {/* Page Content */}
        <main className="pt-20">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;