import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckSquare,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { getTask, deleteTask } from "../services/taskService";
import TaskComments from "../components/TaskComments";
import EditTaskModal from "../components/EditTaskModal";

function TaskDetails() {
  const { taskId } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await getTask(taskId);
        setTask(response.task);
      } catch (error) {
        console.error(
          "Failed to fetch task:",
          error.response?.data || error.message
        );

        setError(
          error.response?.data?.message || "Failed to load task."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [taskId]);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) return;

    try {
      setDeleting(true);

      await deleteTask(taskId);

      toast.success("Task deleted successfully");

      navigate(`/projects/${task.project._id}`);
    } catch (error) {
      console.error(
        "Failed to delete task:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message || "Failed to delete task."
      );
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <p className="text-sm text-slate-500">
              Loading task...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-5xl">
          <button
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
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-5xl">
        {/* Back Button */}
        <button
          onClick={() => navigate(`/projects/${task.project._id}`)}
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-600"
        >
          <ArrowLeft size={18} />
          Back to project
        </button>

        {/* Task Details */}
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          {/* Header */}
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <CheckSquare size={24} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Task details
                </p>

                <h1 className="mt-1 text-3xl font-bold text-slate-900">
                  {task.title}
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                  Created by{" "}
                  <span className="font-medium text-slate-700">
                    {task.createdBy?.name || "Unknown user"}
                  </span>
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
              >
                <Pencil size={16} />
                Edit
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 rounded-xl border border-red-100 px-4 py-2.5 text-sm font-semibold text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 size={16} />
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>

          {/* Status Badge */}
          <div className="mt-6">
            <span
              className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
                task.status === "completed"
                  ? "bg-emerald-50 text-emerald-600"
                  : task.status === "in-progress"
                  ? "bg-blue-50 text-blue-600"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {task.status.replace("-", " ")}
            </span>
          </div>

          {/* Description */}
          <div className="mt-8">
            <h2 className="text-sm font-semibold text-slate-900">
              Description
            </h2>

            <div className="mt-3 rounded-xl bg-slate-50 p-5">
              <p className="text-sm leading-6 text-slate-600">
                {task.description || "No description provided."}
              </p>
            </div>
          </div>

          {/* Task Information */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Status */}
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Status
              </p>

              <p className="mt-2 text-sm font-semibold capitalize text-slate-900">
                {task.status.replace("-", " ")}
              </p>
            </div>

            {/* Priority */}
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Priority
              </p>

              <p
                className={`mt-2 text-sm font-semibold capitalize ${
                  task.priority === "urgent"
                    ? "text-red-600"
                    : task.priority === "high"
                    ? "text-orange-600"
                    : task.priority === "medium"
                    ? "text-blue-600"
                    : "text-slate-600"
                }`}
              >
                {task.priority}
              </p>
            </div>

            {/* Assigned To */}
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Assigned to
              </p>

              <p className="mt-2 text-sm font-semibold text-slate-900">
                {task.assignedTo?.name || "Unassigned"}
              </p>
            </div>

            {/* Due Date */}
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Due date
              </p>

              <p className="mt-2 text-sm font-semibold text-slate-900">
                {task.dueDate
                  ? new Date(task.dueDate).toLocaleDateString("en-IN")
                  : "Not set"}
              </p>
            </div>
          </div>

          {/* Project */}
          <div className="mt-6 rounded-xl border border-slate-200 p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Project
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(`/projects/${task.project._id}`)
              }
              className="mt-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
            >
              {task.project?.name || "Unknown project"}
            </button>
          </div>
        </div>

        {/* Comments */}
        <TaskComments taskId={taskId} />

        {/* Edit Modal */}
        {showEditModal && (
          <EditTaskModal
            task={task}
            onClose={() => setShowEditModal(false)}
            onUpdated={(updatedTask) => {
              setTask(updatedTask);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default TaskDetails;