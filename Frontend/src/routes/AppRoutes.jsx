import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import DashboardLayout from "../layouts/DashboardLayout";
import Workspaces from "../pages/Workspaces";
import WorkspaceDetails from "../pages/WorkspaceDetails";
import ProjectDetails from "../pages/ProjectDetails";
import TaskDetails from "../pages/TaskDetails";
import Activity from "../pages/Activity";
import Settings from "../pages/Settings";
import AdminRoute from "./AdminRoute";
import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminWorkspaces from "../pages/admin/AdminWorkspaces";
import AdminWorkspaceDetails from "../pages/admin/AdminWorkspaceDetails";
import AdminProjects from "../pages/admin/AdminProjects";
import AdminProjectDetails from "../pages/admin/AdminProjectDetails";
import AdminTaskDetails from "../pages/admin/AdminTaskDetails";
import AdminActivity from "../pages/admin/AdminActivity";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />

            <Route
              path="/workspaces"
              element={<Workspaces />}
            />

            <Route
              path="/workspaces/:workspaceId"
              element={<WorkspaceDetails />}
            />

            <Route
              path="/projects/:projectId"
              element={<ProjectDetails />}
            />

            <Route
              path="/tasks/:taskId"
              element={<TaskDetails />}
            />
            <Route path="/activity" element={<Activity />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Admin routes */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/workspaces" element={<AdminWorkspaces />} />
            <Route path="/admin/workspaces/:workspaceId" element={<AdminWorkspaceDetails />} />
            <Route path="/admin/projects" element={<AdminProjects />} />
            <Route path="/admin/projects/:projectId" element={<AdminProjectDetails />} />
            <Route path="/admin/tasks/:taskId" element={<AdminTaskDetails />} />
            <Route path="/admin/activity" element={<AdminActivity />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;