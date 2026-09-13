import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getWorkspaces } from "../services/workspaceService";
import { Plus } from "lucide-react";
import CreateWorkspaceModal from "../components/CreateWorkspaceModal";

function Workspaces() {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const response = await getWorkspaces();
        setWorkspaces(response.workspaces || []);
      } catch (error) {
        console.error(
          "Failed to fetch workspaces:",
          error.response?.data || error.message
        );

        setError("Failed to load workspaces.");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaces();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-slate-500">Loading workspaces...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-8">
        <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between">
            <div>
            <h1 className="text-3xl font-bold text-slate-900">
                Workspaces
            </h1>

            <p className="mt-2 text-slate-500">
                Manage your workspaces and teams.
            </p>
            </div>

            <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
            <Plus size={18} />
            Create workspace
            </button>
        </div>

        {/* Workspace list */}
        <div className="mt-8">
            {workspaces.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Plus size={24} />
                </div>

                <h2 className="mt-4 text-lg font-semibold text-slate-900">
                No workspaces yet
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                Create your first workspace to start managing your work.
                </p>

                <button
                onClick={() => setShowCreateModal(true)}
                className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                Create workspace
                </button>
            </div>
            ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {workspaces.map((workspace) => (
                <div
                    key={workspace._id}
                    onClick={() => navigate(`/workspaces/${workspace._id}`)}
                    className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:-translate-y-1 hover:shadow-md"
                >
                    <h2 className="text-lg font-semibold text-slate-900">
                    {workspace.name}
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                    {workspace.description || "No description"}
                    </p>
                </div>
                ))}
            </div>
            )}
        </div>
        </div>

        {/* Create modal */}
        {showCreateModal && (
        <CreateWorkspaceModal
            onClose={() => setShowCreateModal(false)}
            onCreated={(workspace) => {
            setWorkspaces((current) => [workspace, ...current]);
            }}
        />
        )}
    </div>
    );
}

export default Workspaces;