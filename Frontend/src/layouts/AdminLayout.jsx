import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  FolderKanban,
  Activity,
} from "lucide-react";

function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white">
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
        <nav className="space-y-1 p-4">
          <NavLink
            to="/admin"
            end
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600"
          >
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/users"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600"
          >
            <Users size={18} />
            Users
          </NavLink>

          <NavLink
            to="/admin/workspaces"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600"
          >
            <Building2 size={18} />
            Workspaces
          </NavLink>

          <NavLink
            to="/admin/projects"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600"
          >
            <FolderKanban size={18} />
            Projects & Tasks
          </NavLink>

          <NavLink
            to="/admin/activity"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600"
          >
            <Activity size={18} />
            Activity
          </NavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;