import { useEffect, useState } from "react";
import { Search, Eye, Trash2 } from "lucide-react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      const response = await api.get("/admin/projects");

      setProjects(response.data.projects);
    } catch (error) {
      console.error(
        "Failed to fetch projects:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to load projects"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await api.delete(
        `/admin/projects/${projectId}`
      );

      toast.success(
        response.data.message ||
          "Project deleted successfully"
      );

      fetchProjects();
    } catch (error) {
      console.error(
        "Failed to delete project:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to delete project"
      );
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(
    (project) => {
      const searchTerm = search.toLowerCase();

      return (
        project.name
          ?.toLowerCase()
          .includes(searchTerm) ||
        project.workspace?.name
          ?.toLowerCase()
          .includes(searchTerm) ||
        project.createdBy?.name
          ?.toLowerCase()
          .includes(searchTerm) ||
        project.createdBy?.email
          ?.toLowerCase()
          .includes(searchTerm)
      );
    }
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Projects & Tasks
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Monitor projects and their task counts across
            WorkSphere.
          </p>
        </div>

        <div className="w-fit rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600">
          {filteredProjects.length} Projects
        </div>
      </div>

      {/* Search */}
      <div className="mt-6">
        <div className="relative w-full sm:max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search projects, workspaces, or users..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* Projects Table */}
      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <div className="px-6 py-10 text-center text-sm text-slate-500">
            Loading projects...
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-slate-500">
            No projects found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px]">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                    Project
                  </th>

                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                    Workspace
                  </th>

                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                    Created By
                  </th>

                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                    Status
                  </th>

                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                    Tasks
                  </th>

                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                    Created
                  </th>

                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredProjects.map((project) => (
                  <tr
                    key={project._id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-4 py-4 sm:px-6">
                      <p className="font-medium text-slate-900">
                        {project.name}
                      </p>

                      <p className="mt-1 max-w-xs truncate text-sm text-slate-500">
                        {project.description ||
                          "No description"}
                      </p>
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-700 sm:px-6">
                      {project.workspace?.name || "—"}
                    </td>

                    <td className="px-4 py-4 sm:px-6">
                      <p className="text-sm font-medium text-slate-700">
                        {project.createdBy?.name ||
                          "Unknown"}
                      </p>

                      <p className="text-xs text-slate-500">
                        {project.createdBy?.email || "—"}
                      </p>
                    </td>

                    <td className="px-4 py-4 sm:px-6">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-700">
                        {project.status}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-sm font-medium text-slate-700 sm:px-6">
                      {project.taskCount}
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-500 sm:px-6">
                      {project.createdAt
                        ? new Date(
                            project.createdAt
                          ).toLocaleDateString()
                        : "—"}
                    </td>

                    <td className="px-4 py-4 sm:px-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            navigate(
                              `/admin/projects/${project._id}`
                            )
                          }
                          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600 transition hover:bg-blue-100"
                        >
                          <Eye size={15} />
                          View
                        </button>

                        <button
                          onClick={() =>
                            handleDeleteProject(
                              project._id
                            )
                          }
                          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-100"
                        >
                          <Trash2 size={15} />
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

export default AdminProjects;