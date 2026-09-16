import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Briefcase,
  MoreVertical,
  Pencil,
  Trash2,
  Loader2,
  AlertTriangle,
  X,
} from "lucide-react";
import { toast } from "sonner";

import {
  getWorkspaces,
  deleteWorkspace,
} from "../services/workspaceService";

import CreateWorkspaceModal from "../components/CreateWorkspaceModal";
import EditWorkspaceModal from "../components/EditWorkspaceModal";

function Workspaces() {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [selectedWorkspace, setSelectedWorkspace] =
    useState(null);

  const [openMenu, setOpenMenu] = useState(null);

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [workspaceToDelete, setWorkspaceToDelete] =
    useState(null);

  const [deletingWorkspace, setDeletingWorkspace] =
    useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getWorkspaces();

        setWorkspaces(response.workspaces || []);
      } catch (error) {
        console.error(
          "Failed to fetch workspaces:",
          error.response?.data || error.message
        );

        setError(
          error.response?.data?.message ||
            "Failed to load workspaces."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaces();
  }, []);

  const handleOpenEdit = (event, workspace) => {
    event.stopPropagation();

    setOpenMenu(null);
    setSelectedWorkspace(workspace);
    setShowEditModal(true);
  };

  const handleWorkspaceUpdated = (updatedWorkspace) => {
    setWorkspaces((current) =>
      current.map((workspace) =>
        String(workspace._id) ===
        String(updatedWorkspace._id)
          ? {
              ...workspace,
              ...updatedWorkspace,
            }
          : workspace
      )
    );

    setSelectedWorkspace(null);
  };

  const handleOpenDelete = (event, workspace) => {
    event.stopPropagation();

    setOpenMenu(null);
    setWorkspaceToDelete(workspace);
    setShowDeleteModal(true);
  };

  const handleDeleteWorkspace = async () => {
    if (!workspaceToDelete?._id) {
      return;
    }

    try {
      setDeletingWorkspace(true);

      await deleteWorkspace(
        workspaceToDelete._id
      );

      setWorkspaces((current) =>
        current.filter(
          (workspace) =>
            String(workspace._id) !==
            String(workspaceToDelete._id)
        )
      );

      toast.success(
        "Workspace deleted successfully."
      );

      setShowDeleteModal(false);
      setWorkspaceToDelete(null);
    } catch (error) {
      console.error(
        "Failed to delete workspace:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to delete workspace."
      );
    } finally {
      setDeletingWorkspace(false);
    }
  };

  const handleCloseDeleteModal = () => {
    if (deletingWorkspace) {
      return;
    }

    setShowDeleteModal(false);
    setWorkspaceToDelete(null);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-slate-500">
            Loading workspaces...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="text-sm font-medium text-red-600">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="p-8"
      onClick={() => setOpenMenu(null)}
    >
      <div className="mx-auto max-w-7xl">

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Workspaces
            </h1>

            <p className="mt-2 text-slate-500">
              Manage your workspaces and teams.
            </p>
          </div>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setShowCreateModal(true);
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            <Plus size={18} />
            Create workspace
          </button>

        </div>

        <div className="mt-8">

          {workspaces.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Briefcase size={24} />
              </div>

              <h2 className="mt-4 text-lg font-semibold text-slate-900">
                No workspaces yet
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Create your first workspace to
                start managing your work.
              </p>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setShowCreateModal(true);
                }}
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
                  onClick={() =>
                    navigate(
                      `/workspaces/${workspace._id}`
                    )
                  }
                  className="group relative cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
                >

                  <div className="flex items-start justify-between gap-4">

                    <div className="flex min-w-0 items-center gap-3">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Briefcase size={21} />
                      </div>

                      <h2 className="truncate text-lg font-semibold text-slate-900">
                        {workspace.name}
                      </h2>

                    </div>

                    <div className="relative shrink-0">

                      <button
                        type="button"
                        aria-label="Workspace options"
                        onClick={(event) => {
                          event.stopPropagation();

                          setOpenMenu(
                            openMenu === workspace._id
                              ? null
                              : workspace._id
                          );
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      >
                        <MoreVertical size={19} />
                      </button>

                      {openMenu === workspace._id && (
                        <div
                          className="absolute right-0 top-10 z-30 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl"
                          onClick={(event) =>
                            event.stopPropagation()
                          }
                        >

                          <button
                            type="button"
                            onClick={(event) =>
                              handleOpenEdit(
                                event,
                                workspace
                              )
                            }
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                          >
                            <Pencil
                              size={16}
                              className="text-slate-400"
                            />
                            Edit workspace
                          </button>

                          <button
                            type="button"
                            onClick={(event) =>
                              handleOpenDelete(
                                event,
                                workspace
                              )
                            }
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                            Delete workspace
                          </button>

                        </div>
                      )}

                    </div>

                  </div>

                  <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-500">
                    {workspace.description ||
                      "No description"}
                  </p>

                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">

                    <span className="text-xs font-medium text-slate-400">
                      Open workspace
                    </span>

                    <span className="text-sm font-semibold text-blue-600 opacity-0 transition group-hover:opacity-100">
                      View →
                    </span>

                  </div>

                </div>
              ))}

            </div>
          )}

        </div>

      </div>

      {showCreateModal && (
        <CreateWorkspaceModal
          onClose={() =>
            setShowCreateModal(false)
          }
          onCreated={(workspace) => {
            setWorkspaces((current) => [
              ...current,
              workspace,
            ]);

            setShowCreateModal(false);
          }}
        />
      )}

      {showEditModal && selectedWorkspace && (
        <EditWorkspaceModal
          workspace={selectedWorkspace}
          onClose={() => {
            setShowEditModal(false);
            setSelectedWorkspace(null);
          }}
          onUpdated={handleWorkspaceUpdated}
        />
      )}

      {showDeleteModal && workspaceToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm"
          onClick={handleCloseDeleteModal}
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
                  Delete workspace?
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-slate-700">
                    {workspaceToDelete.name}
                  </span>
                  ? This action cannot be undone.
                </p>

              </div>

              <button
                type="button"
                onClick={handleCloseDeleteModal}
                disabled={deletingWorkspace}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={19} />
              </button>

            </div>

            <div className="flex justify-end gap-3 px-6 py-5">

              <button
                type="button"
                onClick={handleCloseDeleteModal}
                disabled={deletingWorkspace}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteWorkspace}
                disabled={deletingWorkspace}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingWorkspace && (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                )}

                {deletingWorkspace
                  ? "Deleting..."
                  : "Delete workspace"}
              </button>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default Workspaces;