import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  FolderKanban,
  ListTodo,
  Loader2,
  ArrowRight,
  CircleAlert,
  CircleDot,
  CircleCheck,
} from "lucide-react";
import { toast } from "sonner";

import { getWorkspaces } from "../services/workspaceService";
import { getWorkspaceProjects } from "../services/projectService";
import { getProjectTasks } from "../services/taskService";

function Dashboard() {
  const navigate = useNavigate();

  const currentUser = useSelector(
    (state) => state.auth.user
  );

  const [workspaces, setWorkspaces] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);

        const workspaceResponse = await getWorkspaces();

        const workspaceList =
          workspaceResponse?.workspaces ||
          workspaceResponse?.data ||
          [];

        setWorkspaces(
          Array.isArray(workspaceList)
            ? workspaceList
            : []
        );

        const projectResults =
          await Promise.all(
            workspaceList.map(async (workspace) => {
              try {
                const workspaceId =
                  workspace?._id || workspace?.id;

                if (!workspaceId) {
                  return [];
                }

                const response =
                  await getWorkspaceProjects(
                    workspaceId
                  );

                const workspaceProjects =
                  response?.projects ||
                  response?.data ||
                  [];

                return Array.isArray(
                  workspaceProjects
                )
                  ? workspaceProjects.map(
                      (project) => ({
                        ...project,
                        workspace:
                          project.workspace ||
                          workspace,
                      })
                    )
                  : [];
              } catch (error) {
                console.error(
                  `Failed to load projects for workspace ${workspace?._id}:`,
                  error.response?.data ||
                    error.message
                );

                return [];
              }
            })
          );

        const projectList =
          projectResults.flat();

        setProjects(projectList);

        const taskResults =
          await Promise.all(
            projectList.map(async (project) => {
              try {
                const projectId =
                  project?._id ||
                  project?.id;

                if (!projectId) {
                  return [];
                }

                const response =
                  await getProjectTasks(
                    projectId
                  );

                const projectTasks =
                  response?.tasks ||
                  response?.data ||
                  [];

                return Array.isArray(projectTasks)
                  ? projectTasks.map((task) => ({
                      ...task,
                      project:
                        task.project ||
                        project,
                    }))
                  : [];
              } catch (error) {
                console.error(
                  `Failed to load tasks for project ${project?._id}:`,
                  error.response?.data ||
                    error.message
                );

                return [];
              }
            })
          );

        setTasks(taskResults.flat());
      } catch (error) {
        console.error(
          "Failed to load dashboard:",
          error.response?.data ||
            error.message
        );

        toast.error(
          error.response?.data?.message ||
            "Failed to load dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const statistics = useMemo(() => {
    const completed = tasks.filter(
      (task) => task.status === "completed"
    ).length;

    const inProgress = tasks.filter(
      (task) =>
        task.status === "in-progress"
    ).length;

    const todo = tasks.filter(
      (task) => task.status === "todo"
    ).length;

    const completionPercentage =
      tasks.length > 0
        ? Math.round(
            (completed / tasks.length) * 100
          )
        : 0;

    return {
      completed,
      inProgress,
      todo,
      completionPercentage,
    };
  }, [tasks]);

  const recentProjects = useMemo(() => {
    return [...projects]
      .sort((a, b) => {
        const dateA = new Date(
          a.updatedAt ||
            a.createdAt ||
            0
        ).getTime();

        const dateB = new Date(
          b.updatedAt ||
            b.createdAt ||
            0
        ).getTime();

        return dateB - dateA;
      })
      .slice(0, 5);
  }, [projects]);

  const recentTasks = useMemo(() => {
    return [...tasks]
      .sort((a, b) => {
        const dateA = new Date(
          a.updatedAt ||
            a.createdAt ||
            0
        ).getTime();

        const dateB = new Date(
          b.updatedAt ||
            b.createdAt ||
            0
        ).getTime();

        return dateB - dateA;
      })
      .slice(0, 6);
  }, [tasks]);

  const formatDate = (date) => {
    if (!date) {
      return "No due date";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "No due date";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getProjectStatusStyle = (status) => {
    if (status === "completed") {
      return "bg-emerald-50 text-emerald-600";
    }

    if (status === "archived") {
      return "bg-slate-100 text-slate-500";
    }

    return "bg-blue-50 text-blue-600";
  };

  const getTaskStatusStyle = (status) => {
    if (status === "completed") {
      return "bg-emerald-50 text-emerald-600";
    }

    if (status === "in-progress") {
      return "bg-blue-50 text-blue-600";
    }

    return "bg-slate-100 text-slate-600";
  };

  const getPriorityStyle = (priority) => {
    if (priority === "urgent") {
      return "bg-red-50 text-red-600";
    }

    if (priority === "high") {
      return "bg-orange-50 text-orange-600";
    }

    if (priority === "medium") {
      return "bg-amber-50 text-amber-600";
    }

    return "bg-slate-100 text-slate-500";
  };

  const getTaskStatusLabel = (status) => {
    if (status === "in-progress") {
      return "In Progress";
    }

    if (status === "completed") {
      return "Completed";
    }

    return "Todo";
  };

  const getProjectStatusLabel = (status) => {
    if (status === "in-progress") {
      return "In Progress";
    }

    if (status === "completed") {
      return "Completed";
    }

    if (status === "archived") {
      return "Archived";
    }

    return "Active";
  };

  const getPriorityLabel = (priority) => {
    if (!priority) {
      return "Medium";
    }

    return (
      priority.charAt(0).toUpperCase() +
      priority.slice(1)
    );
  };

  const getUserName = () => {
    if (currentUser?.name) {
      return currentUser.name;
    }

    if (currentUser?.email) {
      return currentUser.email
        .split("@")[0];
    }

    return "there";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 sm:p-8">
        <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-slate-500">
            <Loader2
              size={30}
              className="animate-spin text-blue-600"
            />
            <p className="text-sm font-medium">
              Loading your dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">

        <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                Workspace Overview
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
                Welcome back, {getUserName()} 👋
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Manage your projects, tasks and
                team from one place.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/workspaces")
              }
              className="flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              View workspaces
              <ArrowRight size={17} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Workspaces
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {workspaces.length}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <BriefcaseBusiness size={21} />
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-400">
              Workspaces you belong to
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Projects
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {projects.length}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <FolderKanban size={21} />
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-400">
              Projects across your workspaces
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Tasks
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {tasks.length}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <ListTodo size={21} />
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-400">
              Tasks across all projects
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Completed
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {statistics.completed}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={21} />
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-400">
              {statistics.completionPercentage}% of all tasks
            </p>
          </div>

        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Task Overview
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Current progress across all your tasks.
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Clock3 size={19} />
              </div>
            </div>

            <div className="mt-7">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-600">
                  Overall completion
                </span>

                <span className="font-bold text-slate-900">
                  {statistics.completionPercentage}%
                </span>
              </div>

              <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-500"
                  style={{
                    width: `${statistics.completionPercentage}%`,
                  }}
                />
              </div>
            </div>

            <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center gap-2">
                  <CircleDot
                    size={17}
                    className="text-slate-500"
                  />

                  <span className="text-sm font-medium text-slate-600">
                    Todo
                  </span>
                </div>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {statistics.todo}
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center gap-2">
                  <Clock3
                    size={17}
                    className="text-blue-600"
                  />

                  <span className="text-sm font-medium text-slate-600">
                    In Progress
                  </span>
                </div>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {statistics.inProgress}
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center gap-2">
                  <CircleCheck
                    size={17}
                    className="text-emerald-600"
                  />

                  <span className="text-sm font-medium text-slate-600">
                    Completed
                  </span>
                </div>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {statistics.completed}
                </p>
              </div>

            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Task Status
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Breakdown of your tasks.
                </p>
              </div>

              <ListTodo
                size={20}
                className="text-blue-600"
              />
            </div>

            <div className="mt-6 space-y-5">

              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-600">
                    Todo
                  </span>

                  <span className="font-semibold text-slate-900">
                    {statistics.todo}
                  </span>
                </div>

                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-slate-400"
                    style={{
                      width: `${
                        tasks.length
                          ? (statistics.todo /
                              tasks.length) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-600">
                    In Progress
                  </span>

                  <span className="font-semibold text-slate-900">
                    {statistics.inProgress}
                  </span>
                </div>

                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-blue-600"
                    style={{
                      width: `${
                        tasks.length
                          ? (statistics.inProgress /
                              tasks.length) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-600">
                    Completed
                  </span>

                  <span className="font-semibold text-slate-900">
                    {statistics.completed}
                  </span>
                </div>

                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-emerald-500"
                    style={{
                      width: `${
                        tasks.length
                          ? (statistics.completed /
                              tasks.length) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

            </div>

            {tasks.length === 0 && (
              <div className="mt-6 rounded-xl bg-slate-50 px-4 py-5 text-center">
                <CircleAlert
                  size={22}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-2 text-sm text-slate-500">
                  No tasks available yet.
                </p>
              </div>
            )}
          </div>

        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Recent Projects
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your most recently updated projects.
              </p>
            </div>
          </div>

          {recentProjects.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <FolderKanban
                size={28}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 text-sm font-medium text-slate-500">
                No projects yet.
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Create a project from one of your workspaces.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentProjects.map(
                (project) => {
                  const projectId =
                    project?._id ||
                    project?.id;

                  return (
                    <button
                      key={projectId}
                      type="button"
                      onClick={() =>
                        projectId &&
                        navigate(
                          `/projects/${projectId}`
                        )
                      }
                      className="flex w-full flex-col gap-4 px-6 py-5 text-left transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <FolderKanban
                              size={18}
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {project.name ||
                                "Untitled project"}
                            </p>

                            <p className="mt-1 truncate text-xs text-slate-400">
                              {project.workspace
                                ?.name ||
                                "Workspace"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-4">
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getProjectStatusStyle(
                            project.status
                          )}`}
                        >
                          {getProjectStatusLabel(
                            project.status
                          )}
                        </span>

                        <ArrowRight
                          size={17}
                          className="text-slate-300"
                        />
                      </div>
                    </button>
                  );
                }
              )}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="text-lg font-bold text-slate-900">
              Recent Tasks
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Keep track of your latest task activity.
            </p>
          </div>

          {recentTasks.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <ListTodo
                size={28}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 text-sm font-medium text-slate-500">
                No tasks yet.
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Tasks created in your projects will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentTasks.map((task) => {
                const taskId =
                  task?._id || task?.id;

                return (
                  <button
                    key={taskId}
                    type="button"
                    onClick={() =>
                      taskId &&
                      navigate(
                        `/tasks/${taskId}`
                      )
                    }
                    className="flex w-full flex-col gap-4 px-6 py-5 text-left transition hover:bg-slate-50 lg:flex-row lg:items-center"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                        <ListTodo
                          size={18}
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {task.title ||
                            "Untitled task"}
                        </p>

                        <p className="mt-1 truncate text-xs text-slate-400">
                          {typeof task.project ===
                          "object"
                            ? task.project?.name ||
                              "Project"
                            : "Project"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:shrink-0">
                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getTaskStatusStyle(
                          task.status
                        )}`}
                      >
                        {getTaskStatusLabel(
                          task.status
                        )}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getPriorityStyle(
                          task.priority
                        )}`}
                      >
                        {getPriorityLabel(
                          task.priority
                        )}
                      </span>

                      <span className="text-xs font-medium text-slate-400">
                        {formatDate(
                          task.dueDate
                        )}
                      </span>

                      <ArrowRight
                        size={17}
                        className="text-slate-300"
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Dashboard;