import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckSquare,
  Pencil,
  Trash2,
  AlertTriangle,
  X,
  Loader2,
  CalendarDays,
  User,
  Flag,
} from "lucide-react";
import { toast } from "sonner";

import {
  getProject,
} from "../services/projectService";

import {
  getTask,
  deleteTask,
} from "../services/taskService";

import TaskComments from "../components/TaskComments";
import EditTaskModal from "../components/EditTaskModal";

function TaskDetails() {
  const { taskId } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getTask(taskId);

        const fetchedTask = response?.task;

        if (!fetchedTask) {
          throw new Error("Task data not found.");
        }

        let completeTask = fetchedTask;

        const projectId =
          typeof fetchedTask.project === "object"
            ? fetchedTask.project?._id
            : fetchedTask.project;

        if (projectId) {
          try {
            const projectResponse =
              await getProject(projectId);

            const fetchedProject =
              projectResponse?.project;

            if (fetchedProject) {
              completeTask = {
                ...fetchedTask,
                project: {
                  ...fetchedTask.project,
                  ...fetchedProject,
                },
              };
            }
          } catch (projectError) {
            console.error(
              "Failed to fetch project details:",
              projectError.response?.data ||
                projectError.message
            );
          }
        }

        setTask(completeTask);
      } catch (error) {
        console.error(
          "Failed to fetch task:",
          error.response?.data ||
            error.message
        );

        setError(
          error.response?.data?.message ||
            error.message ||
            "Failed to load task."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTaskDetails();
  }, [taskId]);

  const getStatusLabel = (status) => {
    switch (status) {
      case "todo":
        return "To Do";

      case "in-progress":
        return "In Progress";

      case "completed":
        return "Completed";

      default:
        return status || "Unknown";
    }
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "todo":
        return "border-slate-200 bg-slate-50 text-slate-600";

      case "in-progress":
        return "border-blue-100 bg-blue-50 text-blue-600";

      case "completed":
        return "border-green-100 bg-green-50 text-green-600";

      default:
        return "border-slate-200 bg-slate-50 text-slate-600";
    }
  };

  const getPriorityLabel = (priority) => {
    if (!priority) {
      return "Not set";
    }

    return (
      priority.charAt(0).toUpperCase() +
      priority.slice(1)
    );
  };

  const getPriorityClasses = (priority) => {
    switch (priority) {
      case "urgent":
        return "border-red-100 bg-red-50 text-red-600";

      case "high":
        return "border-orange-100 bg-orange-50 text-orange-600";

      case "medium":
        return "border-blue-100 bg-blue-50 text-blue-600";

      case "low":
        return "border-slate-200 bg-slate-50 text-slate-600";

      default:
        return "border-slate-200 bg-slate-50 text-slate-600";
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "Not set";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not set";
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

  const getProjectId = () => {
    if (!task?.project) {
      return null;
    }

    if (typeof task.project === "object") {
      return task.project?._id || null;
    }

    return task.project;
  };

  const getWorkspaceId = () => {
    const workspace = task?.project?.workspace;

    if (!workspace) {
      return null;
    }

    if (typeof workspace === "object") {
      return workspace?._id || null;
    }

    if (typeof workspace === "string") {
      return workspace;
    }

    return null;
  };

  const handleBackToProject = () => {
    const projectId = getProjectId();

    if (!projectId) {
      toast.error(
        "Unable to determine the project."
      );
      return;
    }

    navigate(`/projects/${projectId}`);
  };

  const handleTaskUpdated = (updatedTask) => {
    setTask((current) => {
      if (!current) {
        return updatedTask;
      }

      return {
        ...current,
        ...updatedTask,
        project: current.project,
      };
    });

    setShowEditModal(false);

    toast.success(
      "Task updated successfully."
    );
  };

  const handleDeleteTask = async () => {
    try {
      setDeleting(true);

      await deleteTask(taskId);

      toast.success(
        "Task deleted successfully."
      );

      const projectId = getProjectId();

      if (projectId) {
        navigate(`/projects/${projectId}`, {
          replace: true,
        });
      } else {
        navigate("/workspaces", {
          replace: true,
        });
      }
    } catch (error) {
      console.error(
        "Failed to delete task:",
        error.response?.data ||
          error.message
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to delete task."
      );

      setDeleting(false);
    }
  };

  const handleCloseDeleteModal = () => {
    if (deleting) {
      return;
    }

    setShowDeleteModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3">
              <Loader2
                size={20}
                className="animate-spin text-blue-600"
              />

              <p className="text-sm font-medium text-slate-500">
                Loading task...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-600"
          >
            <ArrowLeft size={18} />
            Go back
          </button>

          <div className="rounded-2xl border border-red-100 bg-red-50 p-8">
            <p className="text-sm font-medium text-red-600">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!task) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        <button
          type="button"
          onClick={handleBackToProject}
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-600"
        >
          <ArrowLeft size={18} />
          Back to project
        </button>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

            <div className="flex min-w-0 items-start gap-4">

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <CheckSquare size={26} />
              </div>

              <div className="min-w-0">

                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Task details
                </p>

                <h1 className="mt-1 break-words text-2xl font-bold text-slate-900 sm:text-3xl">
                  {task.title}
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                  Created by{" "}
                  <span className="font-medium text-slate-700">
                    {task.createdBy?.name ||
                      "Unknown user"}
                  </span>
                </p>

              </div>
            </div>

            <div className="flex shrink-0 gap-3">
              <button
                type="button"
                onClick={() =>
                  setShowEditModal(
                    true
                  )
                }
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-blue-600"
              >
                <Pencil size={16} />
                Edit task
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowDeleteModal(
                    true
                  )
                }
                className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
              >
                <Trash2 size={16} />
                Delete task
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">

            <span
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusClasses(
                task.status
              )}`}
            >
              {getStatusLabel(task.status)}
            </span>

            <span
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${getPriorityClasses(
                task.priority
              )}`}
            >
              {getPriorityLabel(task.priority)}
            </span>

          </div>

          <div className="mt-8">

            <h2 className="text-sm font-semibold text-slate-900">
              Description
            </h2>

            <div className="mt-3 rounded-xl bg-slate-50 p-5">

              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {task.description ||
                  "No description provided."}
              </p>

            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-xl border border-slate-200 p-4">

              <div className="flex items-center gap-2 text-slate-400">
                <CheckSquare size={16} />

                <p className="text-xs font-medium uppercase tracking-wide">
                  Status
                </p>
              </div>

              <p className="mt-3 text-sm font-semibold text-slate-900">
                {getStatusLabel(task.status)}
              </p>

            </div>

            <div className="rounded-xl border border-slate-200 p-4">

              <div className="flex items-center gap-2 text-slate-400">
                <Flag size={16} />

                <p className="text-xs font-medium uppercase tracking-wide">
                  Priority
                </p>
              </div>

              <p className="mt-3 text-sm font-semibold text-slate-900">
                {getPriorityLabel(task.priority)}
              </p>

            </div>

            <div className="rounded-xl border border-slate-200 p-4">

              <div className="flex items-center gap-2 text-slate-400">
                <User size={16} />

                <p className="text-xs font-medium uppercase tracking-wide">
                  Assigned to
                </p>
              </div>

              <p className="mt-3 truncate text-sm font-semibold text-slate-900">
                {task.assignedTo?.name ||
                  "Unassigned"}
              </p>

            </div>

            <div className="rounded-xl border border-slate-200 p-4">

              <div className="flex items-center gap-2 text-slate-400">
                <CalendarDays size={16} />

                <p className="text-xs font-medium uppercase tracking-wide">
                  Due date
                </p>
              </div>

              <p className="mt-3 text-sm font-semibold text-slate-900">
                {formatDate(task.dueDate)}
              </p>

            </div>

          </div>

          <div className="mt-6 rounded-xl border border-slate-200 p-5">

            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Project
            </p>

            <button
              type="button"
              onClick={handleBackToProject}
              className="mt-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
            >
              {task.project?.name ||
                "Unknown project"}
            </button>

          </div>

        </div>

        <TaskComments taskId={taskId} />

        {showEditModal && (
          <EditTaskModal
            task={task}
            workspaceId={getWorkspaceId()}
            onClose={() =>
              setShowEditModal(false)
            }
            onUpdated={handleTaskUpdated}
          />
        )}

        {showDeleteModal && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm"
            onClick={
              handleCloseDeleteModal
            }
          >
            <div
              className="w-full max-w-md rounded-2xl bg-white shadow-2xl"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              <div className="flex items-start gap-4 border-b border-slate-100 px-6 py-5">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <AlertTriangle size={21} />
                </div>

                <div className="min-w-0 flex-1">

                  <h3 className="text-lg font-bold text-slate-900">
                    Delete task?
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    This will permanently delete{" "}
                    <span className="font-semibold text-slate-700">
                      {task.title}
                    </span>
                    . This action cannot be undone.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={
                    handleCloseDeleteModal
                  }
                  disabled={deleting}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X size={19} />
                </button>

              </div>

              <div className="flex justify-end gap-3 px-6 py-5">

                <button
                  type="button"
                  onClick={
                    handleCloseDeleteModal
                  }
                  disabled={deleting}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDeleteTask}
                  disabled={deleting}
                  className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deleting && (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  )}

                  {deleting
                    ? "Deleting..."
                    : "Delete Task"}
                </button>

              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default TaskDetails;