import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  FolderKanban,
} from "lucide-react";
import { getProject } from "../services/projectService";
import { getProjectTasks } from "../services/taskService";
import CreateTaskModal from "../components/CreateTaskModal";

function ProjectDetails() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await getProject(projectId);
        setProject(response.project);
        const tasksResponse = await getProjectTasks(projectId);
        setTasks(tasksResponse.tasks || []);
      } catch (error) {
        console.error(
          "Failed to fetch project:",
          error.response?.data || error.message
        );

        setError(
          error.response?.data?.message ||
            "Failed to load project."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-slate-500">
          Loading project...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm font-medium text-red-600">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  const formatDate = (date) => {
    if (!date) return "Not set";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-7xl">

        {/* Back */}
        <button
          onClick={() =>
            navigate(`/workspaces/${project.workspace._id}`)
          }
          className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
        >
          <ArrowLeft size={18} />
          Back to workspace
        </button>

        {/* Project header */}
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <div className="flex items-start justify-between gap-6">

            <div className="flex items-start gap-5">

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <FolderKanban size={26} />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold text-slate-900">
                    {project.name}
                  </h1>

                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold capitalize text-blue-600">
                    {project.status}
                  </span>
                </div>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                  {project.description ||
                    "No description provided."}
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* Project information */}
        <div className="mt-6 grid gap-5 md:grid-cols-2">

          {/* Created by */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Created by
            </p>

            <p className="mt-2 font-semibold text-slate-900">
              {project.createdBy?.name || "Unknown"}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {project.createdBy?.email || ""}
            </p>
          </div>

          {/* Dates */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <CalendarDays
                size={20}
                className="text-blue-600"
              />

              <p className="text-sm font-semibold text-slate-900">
                Project timeline
              </p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">

              <div>
                <p className="text-xs text-slate-400">
                  Start date
                </p>

                <p className="mt-1 text-sm font-medium text-slate-700">
                  {formatDate(project.startDate)}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Due date
                </p>

                <p className="mt-1 text-sm font-medium text-slate-700">
                  {formatDate(project.dueDate)}
                </p>
              </div>

            </div>
          </div>

        </div>

        {/* Tasks */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                <h2 className="text-lg font-bold text-slate-900">
                    Tasks
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                    Tasks belonging to this project.
                </p>
                </div>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
                </span>
                <button
                    onClick={() => setShowCreateTaskModal(true)}
                    className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                >
                    + Create task
                </button>
            </div>

            {tasks.length === 0 ? (
                <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-8 text-center">
                <p className="text-sm font-medium text-slate-600">
                    No tasks yet
                </p>

                <p className="mt-1 text-sm text-slate-400">
                    Create a task to start working on this project.
                </p>
                </div>
            ) : (
                <div className="mt-6 space-y-3">
                {tasks.map((task) => (
                    <div
                    key={task._id}
                    onClick={() => navigate(`/tasks/${task._id}`)}
                    className="cursor-pointer rounded-xl border border-slate-200 p-4 transition hover:border-blue-200 hover:shadow-sm"
                    >
                    <div className="flex items-start justify-between gap-4">
                        <div>
                        <h3 className="font-semibold text-slate-900">
                            {task.title}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            {task.description || "No description"}
                        </p>
                        </div>

                        <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-600">
                        {task.status}
                        </span>
                    </div>

                    <div className="mt-3">
                        <span className="text-xs font-medium capitalize text-slate-400">
                        Priority: {task.priority}
                        </span>
                    </div>
                    </div>
                ))}
                </div>
            )}
        </div>

      </div>
      {showCreateTaskModal && (
        <CreateTaskModal
          projectId={projectId}
          workspaceId={project.workspace._id}
          onClose={() => setShowCreateTaskModal(false)}
          onCreated={(task) => {
            setTasks((current) => [task, ...current]);
          }}
        />
      )}
    </div>
  );
}

export default ProjectDetails;