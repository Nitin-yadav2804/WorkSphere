import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ClipboardList,
  User,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import { toast } from "sonner";

function AdminTaskDetails() {
  const { taskId } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTask = async () => {
    try {
      const response = await api.get(
        `/admin/tasks/${taskId}`
      );

      setTask(response.data.task);
    } catch (error) {
      console.error(
        "Failed to fetch task:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to load task"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <p className="text-slate-500">
          Loading task...
        </p>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <button
          onClick={() =>
            navigate("/admin/projects")
          }
          className="mb-6 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft size={16} />
          Back to Projects
        </button>

        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
          <h1 className="text-xl font-semibold text-slate-900">
            Task not found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            The task could not be loaded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Back */}
      <button
        onClick={() =>
          navigate(
            `/admin/projects/${task.project?._id}`
          )
        }
        className="mb-6 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-blue-600 transition hover:text-blue-700"
      >
        <ArrowLeft size={16} />
        Back to Project
      </button>

      {/* Header */}
      <div>
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
          <h1 className="break-words text-2xl font-bold text-slate-900">
            {task.title}
          </h1>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-700">
            {task.status}
          </span>
        </div>

        <p className="mt-2 text-sm text-slate-500 sm:text-base">
          {task.description ||
            "No description provided."}
        </p>
      </div>

      {/* Information Cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:mt-8 md:grid-cols-3">
        {/* Project */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <ClipboardList
              size={20}
              className="shrink-0 text-blue-600"
            />

            <div className="min-w-0">
              <p className="text-sm text-slate-500">
                Project
              </p>

              <p className="mt-1 truncate font-semibold text-slate-900">
                {task.project?.name || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Assigned User */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <User
              size={20}
              className="shrink-0 text-blue-600"
            />

            <div className="min-w-0">
              <p className="text-sm text-slate-500">
                Assigned To
              </p>

              <p className="mt-1 truncate font-semibold text-slate-900">
                {task.assignedTo?.name ||
                  "Unassigned"}
              </p>

              <p className="truncate text-xs text-slate-500">
                {task.assignedTo?.email || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Priority */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Priority
          </p>

          <p className="mt-1 font-semibold capitalize text-slate-900">
            {task.priority || "—"}
          </p>
        </div>
      </div>

      {/* Task Information */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white md:mt-8">
        <div className="border-b border-slate-200 px-4 py-5 sm:px-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Task Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Detailed information about this task.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 md:grid-cols-2">
          {/* Status */}
          <div>
            <p className="text-sm font-medium text-slate-500">
              Status
            </p>

            <p className="mt-1 capitalize text-slate-900">
              {task.status || "—"}
            </p>
          </div>

          {/* Priority */}
          <div>
            <p className="text-sm font-medium text-slate-500">
              Priority
            </p>

            <p className="mt-1 capitalize text-slate-900">
              {task.priority || "—"}
            </p>
          </div>

          {/* Due Date */}
          <div>
            <p className="text-sm font-medium text-slate-500">
              Due Date
            </p>

            <p className="mt-1 text-slate-900">
              {task.dueDate
                ? new Date(
                    task.dueDate
                  ).toLocaleDateString()
                : "No due date"}
            </p>
          </div>

          {/* Created */}
          <div>
            <p className="text-sm font-medium text-slate-500">
              Created
            </p>

            <p className="mt-1 text-slate-900">
              {task.createdAt
                ? new Date(
                    task.createdAt
                  ).toLocaleDateString()
                : "—"}
            </p>
          </div>

          {/* Created By */}
          <div>
            <p className="text-sm font-medium text-slate-500">
              Created By
            </p>

            <p className="mt-1 text-slate-900">
              {task.createdBy?.name || "Unknown"}
            </p>

            <p className="truncate text-xs text-slate-500">
              {task.createdBy?.email || "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminTaskDetails;