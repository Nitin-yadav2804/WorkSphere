import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  LayoutDashboard,
  Users,
  Building2,
  FolderKanban,
  Activity,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { logout } from "../store/authSlice";

function AdminLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-3xl px-3 py-3 text-sm font-medium transition ${
      isActive
        ? "bg-blue-50 text-blue-600"
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
    }`;

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <header className="fixed left-0 right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden">
        <div className="flex items-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">
            W
          </div>

          <span className="ml-3 text-lg font-bold text-slate-900">
            WorkSphere
          </span>
        </div>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="cursor-pointer rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          aria-label="Toggle navigation"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white transition-transform duration-200 md:sticky md:z-20 md:translate-x-0 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-slate-200 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">
            W
          </div>

          <span className="ml-3 text-lg font-bold text-slate-900">
            WorkSphere
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 overflow-y-auto p-4">
          <NavLink
            to="/admin"
            end
            onClick={() => setSidebarOpen(false)}
            className={navLinkClass}
          >
            <LayoutDashboard size={22} />
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/users"
            onClick={() => setSidebarOpen(false)}
            className={navLinkClass}
          >
            <Users size={22} />
            Users
          </NavLink>

          <NavLink
            to="/admin/workspaces"
            onClick={() => setSidebarOpen(false)}
            className={navLinkClass}
          >
            <Building2 size={22} />
            Workspaces
          </NavLink>

          <NavLink
            to="/admin/projects"
            onClick={() => setSidebarOpen(false)}
            className={navLinkClass}
          >
            <FolderKanban size={22} />
            Projects & Tasks
          </NavLink>

          <NavLink
            to="/admin/activity"
            onClick={() => setSidebarOpen(false)}
            className={navLinkClass}
          >
            <Activity size={22} />
            Activity
          </NavLink>
        </nav>

        {/* Profile + Sign Out */}
        <div className="border-t border-slate-200 p-4">
          {/* Profile */}
          <div className="mb-2 flex items-center gap-3 rounded-2xl px-3 py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {user?.name || "Admin"}
              </p>

              <p className="truncate text-xs text-slate-500">
                {user?.email || ""}
              </p>
            </div>
          </div>

          {/* Sign Out */}
          <button
            onClick={handleLogout}
            className="flex w-full cursor-pointer items-center gap-3 rounded-3xl px-3 py-3 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={22} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-w-0 flex-1 pt-16 md:pt-0">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;