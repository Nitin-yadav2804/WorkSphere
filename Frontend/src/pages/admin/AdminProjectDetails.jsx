import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ClipboardList,
  User,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import { toast } from "sonner";

function AdminProjectDetails() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProject = async () => {
    try {
      const response = await api.get(
        `/admin/projects/${projectId}`
      );

      setProject(response.data.project);
      setTasks(response.data.tasks);
    } catch (error) {
      console.error(
        "Failed to fetch project:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to load project"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const handleDeleteTask = async (taskId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await api.delete(
        `/admin/tasks/${taskId}`
      );

      toast.success(
        response.data.message ||
          "Task deleted successfully"
      );

      fetchProject();
    } catch (error) {
      console.error(
        "Failed to delete task:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to delete task"
      );
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <p className="text-slate-500">
          Loading project...
        </p>
      </div>
    );
  }

  if (!project) {
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
            Project not found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            The project could not be loaded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Back button */}
      <button
        onClick={() =>
          navigate("/admin/projects")
        }
        className="mb-6 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-blue-600 transition hover:text-blue-700"
      >
        <ArrowLeft size={16} />
        Back to Projects
      </button>

      {/* Project header */}
      <div>
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
          <h1 className="text-2xl font-bold text-slate-900">
            {project.name}
          </h1>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-700">
            {project.status}
          </span>
        </div>

        <p className="mt-2 text-sm text-slate-500 sm:text-base">
          {project.description ||
            "No description provided."}
        </p>
      </div>

      {/* Project information cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:mt-8 md:grid-cols-3">
        {/* Total Tasks */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <ClipboardList
              size={20}
              className="shrink-0 text-blue-600"
            />

            <div>
              <p className="text-sm text-slate-500">
                Total Tasks
              </p>

              <p className="mt-1 text-xl font-semibold text-slate-900">
                {tasks.length}
              </p>
            </div>
          </div>
        </div>

        {/* Created By */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <User
              size={20}
              className="shrink-0 text-blue-600"
            />

            <div className="min-w-0">
              <p className="text-sm text-slate-500">
                Created By
              </p>

              <p className="mt-1 truncate font-semibold text-slate-900">
                {project.createdBy?.name ||
                  "Unknown"}
              </p>

              <p className="truncate text-xs text-slate-500">
                {project.createdBy?.email || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Workspace */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Workspace
          </p>

          <p className="mt-1 truncate font-semibold text-slate-900">
            {project.workspace?.name || "—"}
          </p>
        </div>
      </div>

      {/* Tasks */}
      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white md:mt-8">
        <div className="border-b border-slate-200 px-4 py-5 sm:px-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Project Tasks
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Tasks currently associated with this project.
          </p>
        </div>

        {tasks.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-slate-500">
            No tasks found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                    Task
                  </th>

                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                    Assigned To
                  </th>

                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                    Status
                  </th>

                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                    Priority
                  </th>

                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                    Due Date
                  </th>

                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {tasks.map((task) => (
                  <tr
                    key={task._id}
                    className="transition hover:bg-slate-50"
                  >
                    {/* Task */}
                    <td className="px-4 py-4 sm:px-6">
                      <p className="font-medium text-slate-900">
                        {task.title ||
                          "Untitled task"}
                      </p>

                      <p className="mt-1 max-w-md truncate text-sm text-slate-500">
                        {task.description ||
                          "No description"}
                      </p>
                    </td>

                    {/* Assigned To */}
                    <td className="px-4 py-4 sm:px-6">
                      <p className="text-sm font-medium text-slate-700">
                        {task.assignedTo?.name ||
                          "Unassigned"}
                      </p>

                      <p className="text-xs text-slate-500">
                        {task.assignedTo?.email || ""}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4 sm:px-6">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-700">
                        {task.status || "—"}
                      </span>
                    </td>

                    {/* Priority */}
                    <td className="px-4 py-4 sm:px-6">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-700">
                        {task.priority || "—"}
                      </span>
                    </td>

                    {/* Due Date */}
                    <td className="px-4 py-4 text-sm text-slate-500 sm:px-6">
                      {task.dueDate
                        ? new Date(
                            task.dueDate
                          ).toLocaleDateString()
                        : "—"}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4 sm:px-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            navigate(
                              `/admin/tasks/${task._id}`
                            )
                          }
                          className="inline-flex cursor-pointer items-center rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600 transition hover:bg-blue-100"
                        >
                          View
                        </button>

                        <button
                          onClick={() =>
                            handleDeleteTask(task._id)
                          }
                          className="inline-flex cursor-pointer items-center rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminProjectDetails;