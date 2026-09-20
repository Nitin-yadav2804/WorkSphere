import { useEffect, useState } from "react";
import { ArrowLeft, Users, User } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

function AdminWorkspaceDetails() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWorkspace = async () => {
    try {
      const response = await api.get(
        `/admin/workspaces/${workspaceId}`
      );

      setWorkspace(response.data.workspace);
    } catch (error) {
      console.error(
        "Failed to fetch workspace:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspace();
  }, [workspaceId]);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <p className="text-slate-500">
          Loading workspace...
        </p>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <button
          onClick={() =>
            navigate("/admin/workspaces")
          }
          className="mb-6 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft size={16} />
          Back to Workspaces
        </button>

        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
          <h1 className="text-xl font-semibold text-slate-900">
            Workspace not found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            The workspace could not be loaded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <button
        onClick={() =>
          navigate("/admin/workspaces")
        }
        className="mb-6 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-blue-600 transition hover:text-blue-700"
      >
        <ArrowLeft size={16} />
        Back to Workspaces
      </button>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {workspace.name}
        </h1>

        <p className="mt-2 text-sm text-slate-500 sm:text-base">
          {workspace.description ||
            "No description provided."}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:mt-8 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Users size={19} />
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Total Members
              </p>

              <p className="mt-1 text-xl font-bold text-slate-900">
                {workspace.members?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <User size={19} />
            </div>

            <div className="min-w-0">
              <p className="text-sm text-slate-500">
                Owner
              </p>

              <p className="mt-1 truncate text-sm font-semibold text-slate-900">
                {workspace.owner?.name || "Unknown"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Created
          </p>

          <p className="mt-2 text-sm font-semibold text-slate-900">
            {new Date(
              workspace.createdAt
            ).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Members */}
      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white md:mt-8">
        <div className="border-b border-slate-200 px-4 py-5 sm:px-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Workspace Members
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Users who are members of this workspace.
          </p>
        </div>

        {workspace.members?.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-slate-500">
            No members found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-slate-700 sm:px-6">
                    Member
                  </th>

                  <th className="px-4 py-4 text-left text-sm font-semibold text-slate-700 sm:px-6">
                    Email
                  </th>

                  <th className="px-4 py-4 text-left text-sm font-semibold text-slate-700 sm:px-6">
                    Role
                  </th>

                  <th className="px-4 py-4 text-left text-sm font-semibold text-slate-700 sm:px-6">
                    Joined
                  </th>
                </tr>
              </thead>

              <tbody>
                {workspace.members?.map((member) => (
                  <tr
                    key={member.user?._id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-4 py-4 sm:px-6">
                      <p className="text-sm font-medium text-slate-900">
                        {member.user?.name || "Unknown"}
                      </p>
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-600 sm:px-6">
                      {member.user?.email || "—"}
                    </td>

                    <td className="px-4 py-4 sm:px-6">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium capitalize text-blue-600">
                        {member.role}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-600 sm:px-6">
                      {member.joinedAt
                        ? new Date(
                            member.joinedAt
                          ).toLocaleDateString()
                        : "—"}
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

export default AdminWorkspaceDetails;