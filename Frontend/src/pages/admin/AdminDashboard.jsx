import { useEffect, useState } from "react";
import {
  Users,
  Building2,
  FolderKanban,
  ClipboardList,
  Activity,
  ArrowUpRight,
  ListTodo,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalWorkspaces: 0,
    totalProjects: 0,
    totalTasks: 0,
  });

  const [taskStats, setTaskStats] = useState({
    todo: 0,
    inProgress: 0,
    completed: 0,
  });

  const [projectStats, setProjectStats] = useState({
    active: 0,
    completed: 0,
    archived: 0,
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const response = await api.get("/admin/dashboard");

      setStats(response.data.stats);
      setTaskStats(response.data.taskStats);
      setProjectStats(response.data.projectStats);
      setRecentActivity(response.data.recentActivity);
    } catch (error) {
      console.error(
        "Failed to fetch admin dashboard:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-sm text-slate-500">
          Loading dashboard...
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      description: "Registered accounts",
      icon: Users,
    },
    {
      title: "Workspaces",
      value: stats.totalWorkspaces,
      description: "Active collaboration spaces",
      icon: Building2,
    },
    {
      title: "Projects",
      value: stats.totalProjects,
      description: "Projects across WorkSphere",
      icon: FolderKanban,
    },
    {
      title: "Tasks",
      value: stats.totalTasks,
      description: "Tasks being managed",
      icon: ClipboardList,
    },
  ];

  const quickActions = [
    {
      title: "Manage Users",
      description: "View and manage accounts",
      icon: Users,
      path: "/admin/users",
    },
    {
      title: "Manage Workspaces",
      description: "Review collaboration spaces",
      icon: Building2,
      path: "/admin/workspaces",
    },
    {
      title: "Manage Projects",
      description: "Inspect projects and tasks",
      icon: FolderKanban,
      path: "/admin/projects",
    },
    {
      title: "View Activity",
      description: "Monitor platform activity",
      icon: Activity,
      path: "/admin/activity",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-5 text-white shadow-lg sm:p-8">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-sm font-medium text-blue-100">
            <Zap size={16} />
            WorkSphere Administration
          </div>

          <h1 className="mt-3 text-2xl font-bold sm:text-3xl">
            Platform Overview
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
            Monitor users, workspaces, projects, tasks, and
            platform activity from one place.
          </p>

          <div className="mt-5 flex items-center gap-2 text-sm sm:mt-6">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400" />

            <span className="text-blue-100">
              System operational
            </span>
          </div>
        </div>

        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10" />
        <div className="absolute -bottom-24 right-20 h-48 w-48 rounded-full bg-white/5" />
      </div>

      {/* Statistics */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-500">
                    {card.title}
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {card.value}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {card.description}
                  </p>
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                  <Icon size={21} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Recent Activity */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <div className="flex items-center gap-2">
                <Activity
                  size={18}
                  className="text-blue-600"
                />

                <h2 className="font-semibold text-slate-900">
                  Recent Activity
                </h2>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Latest events across the platform
              </p>
            </div>

            <button
              onClick={() => navigate("/admin/activity")}
              className="inline-flex w-fit cursor-pointer items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View all
              <ArrowUpRight size={15} />
            </button>
          </div>

          {recentActivity.length === 0 ? (
            <div className="flex min-h-48 items-center justify-center px-6 text-sm text-slate-500">
              No recent activity found.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentActivity.slice(0, 6).map((activity) => (
                <div
                  key={activity._id}
                  className="flex gap-3 px-4 py-4 transition hover:bg-slate-50 sm:gap-4 sm:px-6"
                >
                  <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <Activity size={16} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900">
                          {activity.action || "Activity"}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {activity.description ||
                            "No description"}
                        </p>
                      </div>

                      <span className="shrink-0 text-xs text-slate-400">
                        {activity.createdAt
                          ? new Date(
                              activity.createdAt
                            ).toLocaleDateString()
                          : "—"}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      {activity.user?.name && (
                        <span className="max-w-full truncate rounded-full bg-slate-100 px-2.5 py-1 text-slate-500">
                          {activity.user.name}
                        </span>
                      )}

                      {activity.workspace?.name && (
                        <span className="max-w-full truncate rounded-full bg-blue-50 px-2.5 py-1 text-blue-600">
                          {activity.workspace.name}
                        </span>
                      )}

                      {activity.project?.name && (
                        <span className="max-w-full truncate rounded-full bg-indigo-50 px-2.5 py-1 text-indigo-600">
                          {activity.project.name}
                        </span>
                      )}

                      {activity.task?.title && (
                        <span className="max-w-full truncate rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                          {activity.task.title}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Platform Snapshot */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-blue-600" />

            <h2 className="font-semibold text-slate-900">
              Platform Snapshot
            </h2>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Current workload overview
          </p>

          {/* Tasks */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <ListTodo size={16} />
                Tasks
              </span>

              <span className="text-sm font-semibold text-slate-900">
                {stats.totalTasks}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">
                  To Do
                </p>

                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {taskStats.todo}
                </p>
              </div>

              <div className="rounded-lg bg-blue-50 p-3">
                <p className="text-xs text-blue-600">
                  In Progress
                </p>

                <p className="mt-1 text-lg font-semibold text-blue-700">
                  {taskStats.inProgress}
                </p>
              </div>

              <div className="rounded-lg bg-emerald-50 p-3">
                <p className="text-xs text-emerald-600">
                  Completed
                </p>

                <p className="mt-1 text-lg font-semibold text-emerald-700">
                  {taskStats.completed}
                </p>
              </div>
            </div>
          </div>

          {/* Projects */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <FolderKanban size={16} />
                Projects
              </span>

              <span className="text-sm font-semibold text-slate-900">
                {stats.totalProjects}
              </span>
            </div>

            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2.5">
                <span className="text-sm text-blue-700">
                  Active
                </span>

                <span className="font-semibold text-blue-700">
                  {projectStats.active}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2.5">
                <span className="text-sm text-emerald-700">
                  Completed
                </span>

                <span className="font-semibold text-emerald-700">
                  {projectStats.completed}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-slate-100 px-3 py-2.5">
                <span className="text-sm text-slate-600">
                  Archived
                </span>

                <span className="font-semibold text-slate-700">
                  {projectStats.archived}
                </span>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="mt-6 rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Platform Status
            </p>

            <div className="mt-2 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

              <span className="text-sm font-semibold text-slate-700">
                All systems operational
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div>
          <h2 className="font-semibold text-slate-900">
            Quick Management
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Jump directly to frequently used admin sections.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <button
                key={action.title}
                onClick={() => navigate(action.path)}
                className="group flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition group-hover:bg-blue-600 group-hover:text-white">
                  <Icon size={18} />
                </div>

                <div className="min-w-0">
                  <p className="font-medium text-slate-900">
                    {action.title}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {action.description}
                  </p>
                </div>

                <ArrowUpRight
                  size={16}
                  className="ml-auto shrink-0 text-slate-300 transition group-hover:text-blue-600"
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;