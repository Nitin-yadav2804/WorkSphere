import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  Users,
  FolderKanban,
  Plus,
} from "lucide-react";
import { getWorkspace } from "../services/workspaceService";
import { getWorkspaceProjects } from "../services/projectService";
import CreateProjectModal from "../components/CreateProjectModal";

function WorkspaceDetails() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  const [workspace, setWorkspace] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateProjectModal, setShowCreateProjectModal] =
  useState(false);

  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const response = await getWorkspace(workspaceId);
        setWorkspace(response.workspace);

        const projectsResponse =
          await getWorkspaceProjects(workspaceId);

        setProjects(projectsResponse.projects || []);
      } catch (error) {
        console.error(
          "Failed to fetch workspace:",
          error.response?.data || error.message
        );

        setError(
          error.response?.data?.message ||
            "Failed to load workspace."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspace();
  }, [workspaceId]);

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-slate-500">
          Loading workspace...
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

  if (!workspace) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-7xl">

        {/* Back button */}
        <button
          onClick={() => navigate("/workspaces")}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
        >
          <ArrowLeft size={18} />
          Back to workspaces
        </button>

        {/* Workspace header */}
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <div className="flex items-start gap-5">

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Briefcase size={26} />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {workspace.name}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                {workspace.description ||
                  "No description provided."}
              </p>
            </div>

          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid gap-5 md:grid-cols-2">

          {/* Members */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Users size={21} />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Members
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {workspace.members?.length || 0}
                </p>
              </div>

            </div>
          </div>

          {/* Projects */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <FolderKanban size={21} />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Projects
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {projects.length}
                </p>
              </div>

            </div>
          </div>

        </div>

        {/* Projects section */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

          <div className="flex items-center justify-between">
            <div>
                <h2 className="text-lg font-bold text-slate-900">
                Projects
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                Projects belonging to this workspace.
                </p>
            </div>

            <button
                onClick={() => setShowCreateProjectModal(true)}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
                <Plus size={17} />
                Create project
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-8 text-center">

              <FolderKanban
                size={28}
                className="mx-auto text-slate-400"
              />

              <p className="mt-3 text-sm font-medium text-slate-600">
                No projects yet
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Create a project to start managing tasks.
              </p>

            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">

              {projects.map((project) => (
                <div
                  key={project._id}
                  onClick={() => navigate(`/projects/${project._id}`)}
                  className="rounded-xl border border-slate-200 p-5 transition hover:border-blue-200 hover:shadow-sm"
                >
                  <h3 className="font-semibold text-slate-900">
                    {project.name}
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    {project.description ||
                      "No description"}
                  </p>

                  <div className="mt-4">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold capitalize text-blue-600">
                      {project.status}
                    </span>
                  </div>
                </div>
              ))}

            </div>
          )}

        </div>

      </div>
      {showCreateProjectModal && (
        <CreateProjectModal
            workspaceId={workspaceId}
            onClose={() => setShowCreateProjectModal(false)}
            onCreated={(project) => {
            setProjects((current) => [project, ...current]);
            }}
        />
        )}
    </div>
  );
}

export default WorkspaceDetails;