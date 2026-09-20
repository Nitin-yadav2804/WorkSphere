import { useEffect, useState } from "react";
import { Search, Eye, Trash2 } from "lucide-react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

function AdminWorkspaces() {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  const fetchWorkspaces = async () => {
    try {
      const response = await api.get("/admin/workspaces");

      setWorkspaces(response.data.workspaces);
    } catch (error) {
      console.error(
        "Failed to fetch workspaces:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to load workspaces"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorkspace = async (workspaceId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this workspace?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await api.delete(
        `/admin/workspaces/${workspaceId}`
      );

      toast.success(
        response.data.message ||
          "Workspace deleted successfully"
      );

      fetchWorkspaces();
    } catch (error) {
      console.error(
        "Failed to delete workspace:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to delete workspace"
      );
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const filteredWorkspaces = workspaces.filter(
    (workspace) => {
      const searchTerm = search.toLowerCase();

      return (
        workspace.name
          ?.toLowerCase()
          .includes(searchTerm) ||
        workspace.owner?.name
          ?.toLowerCase()
          .includes(searchTerm) ||
        workspace.owner?.email
          ?.toLowerCase()
          .includes(searchTerm)
      );
    }
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-slate-900">
        Workspace Management
      </h1>

      <p className="mt-2 text-sm text-slate-500 sm:text-base">
        Manage WorkSphere workspaces, owners and members.
      </p>

      {loading ? (
        <p className="mt-8 text-slate-500">
          Loading workspaces...
        </p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white sm:mt-8">
          {/* Search */}
          <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-6 sm:py-6 lg:px-8">
            <div className="relative flex-1">
              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-500"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search workspaces or owners..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              />
            </div>

            <span className="w-fit whitespace-nowrap rounded-lg border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600">
              {filteredWorkspaces.length}{" "}
              {filteredWorkspaces.length === 1
                ? "workspace"
                : "workspaces"}
            </span>
          </div>

          {/* Workspaces Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead className="border-y border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-slate-700 sm:px-6">
                    Workspace
                  </th>

                  <th className="px-4 py-4 text-left text-sm font-semibold text-slate-700 sm:px-6">
                    Owner
                  </th>

                  <th className="px-4 py-4 text-left text-sm font-semibold text-slate-700 sm:px-6">
                    Members
                  </th>

                  <th className="px-4 py-4 text-left text-sm font-semibold text-slate-700 sm:px-6">
                    Created
                  </th>

                  <th className="px-4 py-4 text-left text-sm font-semibold text-slate-700 sm:px-6">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredWorkspaces.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-10 text-center text-sm text-slate-500"
                    >
                      No workspaces found.
                    </td>
                  </tr>
                ) : (
                  filteredWorkspaces.map((workspace) => (
                    <tr
                      key={workspace._id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-4 py-4 sm:px-6">
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {workspace.name}
                          </p>

                          <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                            {workspace.description ||
                              "No description"}
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-4 sm:px-6">
                        <p className="text-sm text-slate-900">
                          {workspace.owner?.name ||
                            "Unknown"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {workspace.owner?.email || "—"}
                        </p>
                      </td>

                      <td className="px-4 py-4 sm:px-6">
                        <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600">
                          {workspace.members?.length || 0}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-600 sm:px-6">
                        {new Date(
                          workspace.createdAt
                        ).toLocaleDateString()}
                      </td>

                      <td className="px-4 py-4 sm:px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              navigate(
                                `/admin/workspaces/${workspace._id}`
                              )
                            }
                            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600 transition hover:bg-blue-100"
                          >
                            <Eye size={15} />
                            View
                          </button>

                          <button
                            onClick={() =>
                              handleDeleteWorkspace(
                                workspace._id
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminWorkspaces;