import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  Users,
  FolderKanban,
  Plus,
  MoreVertical,
  UserPlus,
  Trash2,
  Shield,
  X,
  Check,
  Pencil,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  getWorkspace,
  getWorkspaceMembers,
  removeWorkspaceMember,
  updateWorkspaceMemberRole,
  updateWorkspace,
  deleteWorkspace,
} from "../services/workspaceService";
import {
  getWorkspaceProjects,
  deleteProject,
} from "../services/projectService";
import CreateProjectModal from "../components/CreateProjectModal";
import AddMemberModal from "../components/AddMemberModal";
import EditWorkspaceModal from "../components/EditWorkspaceModal";
import EditProjectModal from "../components/EditProjectModal";

function WorkspaceDetails() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  const [workspace, setWorkspace] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("projects");

  const [showCreateProjectModal, setShowCreateProjectModal] =
    useState(false);

  const [showAddMemberModal, setShowAddMemberModal] =
    useState(false);

  const [showEditWorkspaceModal, setShowEditWorkspaceModal] =
    useState(false);

  const [showDeleteWorkspaceModal, setShowDeleteWorkspaceModal] =
    useState(false);

  const [deletingWorkspace, setDeletingWorkspace] = useState(false);

  const [openMenu, setOpenMenu] = useState(null);

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedRole, setSelectedRole] = useState("member");
  const [updatingRole, setUpdatingRole] = useState(false);
  const [removingMember, setRemovingMember] = useState(null);

  const [showEditProjectModal, setShowEditProjectModal] =
    useState(false);

  const [selectedProject, setSelectedProject] = useState(null);

  const [showDeleteProjectModal, setShowDeleteProjectModal] =
    useState(false);

  const [projectToDelete, setProjectToDelete] = useState(null);

  const [deletingProject, setDeletingProject] = useState(false);

  const fetchWorkspace = async () => {
    try {
      setLoading(true);
      setError("");

      if (!workspaceId) {
        setError("Workspace ID is missing.");
        return;
      }

      const response = await getWorkspace(workspaceId);

      setWorkspace(response.workspace);

      const projectsResponse =
        await getWorkspaceProjects(workspaceId);

      const fetchedProjects =
        projectsResponse.projects || [];

      setProjects(
        [...fetchedProjects].sort(
          (a, b) =>
            new Date(a.createdAt) -
            new Date(b.createdAt)
        )
      );
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

  useEffect(() => {
    fetchWorkspace();
  }, [workspaceId]);

  const fetchMembers = async () => {
    try {
      setLoadingMembers(true);

      if (!workspaceId) {
        toast.error("Workspace ID is missing.");
        return;
      }

      const response =
        await getWorkspaceMembers(workspaceId);

      setWorkspace((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          members: response.members || [],
        };
      });
    } catch (error) {
      console.error(
        "Failed to fetch members:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to refresh members."
      );
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleWorkspaceUpdated = (updatedWorkspace) => {
    setWorkspace((current) => ({
      ...current,
      ...updatedWorkspace,
    }));

    setShowEditWorkspaceModal(false);

    toast.success("Workspace updated successfully.");
  };

  const handleDeleteWorkspace = async () => {
    if (!workspaceId) {
      toast.error("Workspace ID is missing.");
      return;
    }

    try {
      setDeletingWorkspace(true);

      await deleteWorkspace(workspaceId);

      toast.success("Workspace deleted successfully.");

      navigate("/workspaces", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Failed to delete workspace:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to delete workspace."
      );

      setDeletingWorkspace(false);
    }
  };

  const handleOpenRoleModal = (member) => {
    setSelectedMember(member);
    setSelectedRole(member.role || "member");
    setOpenMenu(null);
    setShowRoleModal(true);
  };

  const handleChangeRole = async () => {
    if (!selectedMember?.user?._id) {
      toast.error("Unable to update this member.");
      return;
    }

    if (!workspaceId) {
      toast.error("Workspace ID is missing.");
      return;
    }

    try {
      setUpdatingRole(true);

      await updateWorkspaceMemberRole(
        workspaceId,
        selectedMember.user._id,
        {
          role: selectedRole,
        }
      );

      toast.success(
        "Member role updated successfully."
      );

      setShowRoleModal(false);
      setSelectedMember(null);

      await fetchMembers();
    } catch (error) {
      console.error(
        "Failed to update member role:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to update member role."
      );
    } finally {
      setUpdatingRole(false);
    }
  };

  const handleRemoveMember = async (member) => {
    const user = member?.user;

    if (!user?._id) {
      toast.error("Unable to remove this member.");
      return;
    }

    if (!workspaceId) {
      toast.error("Workspace ID is missing.");
      return;
    }

    setOpenMenu(null);

    const confirmed = window.confirm(
      `Are you sure you want to remove ${
        user.name || "this member"
      } from the workspace?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setRemovingMember(user._id);

      await removeWorkspaceMember(
        workspaceId,
        user._id
      );

      toast.success(
        `${user.name || "Member"} removed successfully.`
      );

      await fetchMembers();
    } catch (error) {
      console.error(
        "Failed to remove member:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to remove member."
      );
    } finally {
      setRemovingMember(null);
    }
  };

  const handleOpenEditProject = (event, project) => {
    event.stopPropagation();

    setOpenMenu(null);
    setSelectedProject(project);
    setShowEditProjectModal(true);
  };

  const handleProjectUpdated = (updatedProject) => {
    setProjects((current) =>
      current.map((project) =>
        String(project._id) ===
        String(updatedProject._id)
          ? {
              ...project,
              ...updatedProject,
            }
          : project
      )
    );

    setSelectedProject(null);
    setShowEditProjectModal(false);

    toast.success("Project updated successfully.");
  };

  const handleOpenDeleteProject = (event, project) => {
    event.stopPropagation();

    setOpenMenu(null);
    setProjectToDelete(project);
    setShowDeleteProjectModal(true);
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete?._id) {
      toast.error("Unable to delete this project.");
      return;
    }

    try {
      setDeletingProject(true);

      await deleteProject(projectToDelete._id);

      setProjects((current) =>
        current.filter(
          (project) =>
            String(project._id) !==
            String(projectToDelete._id)
        )
      );

      toast.success("Project deleted successfully.");

      setShowDeleteProjectModal(false);
      setProjectToDelete(null);
    } catch (error) {
      console.error(
        "Failed to delete project:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to delete project."
      );
    } finally {
      setDeletingProject(false);
    }
  };

  const handleCloseDeleteProjectModal = () => {
    if (deletingProject) {
      return;
    }

    setShowDeleteProjectModal(false);
    setProjectToDelete(null);
  };

  const getMemberRole = (member) => {
    const isOwner =
      String(workspace?.owner?._id) ===
      String(member?.user?._id);

    if (isOwner) {
      return "owner";
    }

    return member?.role || "member";
  };

  const getRoleBadgeClasses = (role) => {
    switch (role) {
      case "owner":
        return "bg-indigo-50 text-indigo-600 border-indigo-100";

      case "manager":
        return "bg-amber-50 text-amber-600 border-amber-100";

      default:
        return "bg-blue-50 text-blue-600 border-blue-100";
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "owner":
        return "Owner";

      case "manager":
        return "Manager";

      default:
        return "Member";
    }
  };

  const getRolePriority = (role) => {
    switch (role) {
      case "owner":
        return 0;

      case "manager":
        return 1;

      default:
        return 2;
    }
  };

  const getProjectStatusBadgeClasses = (status) => {
    switch (status) {
      case "active":
        return "bg-green-50 text-green-600 border-green-100";

      case "completed":
        return "bg-blue-50 text-blue-600 border-blue-100";

      case "archived":
        return "bg-slate-100 text-slate-500 border-slate-200";

      default:
        return "bg-slate-100 text-slate-500 border-slate-200";
    }
  };

  const getProjectStatusLabel = (status) => {
    switch (status) {
      case "active":
        return "Active";

      case "completed":
        return "Completed";

      case "archived":
        return "Archived";

      default:
        return status || "Unknown";
    }
  };

  const sortedMembers = [
    ...(workspace?.members || []),
  ].sort((a, b) => {
    const roleA = getMemberRole(a);
    const roleB = getMemberRole(b);

    return (
      getRolePriority(roleA) -
      getRolePriority(roleB)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-slate-500">
            Loading workspace...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <p className="text-sm font-medium text-red-600">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!workspace) {
    return null;
  }

  return (
    <div
      className="min-h-screen bg-slate-50 p-8"
      onClick={() => setOpenMenu(null)}
    >
      <div className="mx-auto max-w-7xl">
        <button
          type="button"
          onClick={() => navigate("/workspaces")}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
        >
          <ArrowLeft size={18} />
          Back to workspaces
        </button>

        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
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

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setShowEditWorkspaceModal(true);
                }}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
              >
                <Pencil size={16} />
                Edit
              </button>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setShowDeleteWorkspaceModal(true);
                }}
                className="flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>

        <div className="relative mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="rounded-t-2xl border-b border-slate-200 px-6 pt-2 sm:px-8">
            <div className="flex gap-8">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("members");
                  setOpenMenu(null);
                }}
                className={`relative flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-semibold transition ${
                  activeTab === "members"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <Users size={17} />
                Members

                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    activeTab === "members"
                      ? "bg-blue-50 text-blue-600"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {workspace.members?.length || 0}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("projects");
                  setOpenMenu(null);
                }}
                className={`relative flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-semibold transition ${
                  activeTab === "projects"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <FolderKanban size={17} />
                Projects

                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    activeTab === "projects"
                      ? "bg-blue-50 text-blue-600"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {projects.length}
                </span>
              </button>
            </div>
          </div>

          {activeTab === "members" && (
            <div>
              <div className="flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Workspace members
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Manage people and their roles in this
                    workspace.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setShowAddMemberModal(true);
                  }}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                >
                  <UserPlus size={17} />
                  Add member
                </button>
              </div>

              {loadingMembers ? (
                <div className="border-t border-slate-100 p-8">
                  <p className="text-sm text-slate-500">
                    Updating members...
                  </p>
                </div>
              ) : sortedMembers.length === 0 ? (
                <div className="border-t border-slate-100 p-12 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <Users size={26} />
                  </div>

                  <h3 className="mt-4 text-sm font-semibold text-slate-900">
                    No members
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Add members to start collaborating.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 rounded-b-2xl border-t border-slate-100">
                  {sortedMembers.map((member, index) => {
                    const user = member?.user;

                    if (!user) {
                      return null;
                    }

                    const role = getMemberRole(member);
                    const isOwner = role === "owner";

                    const isRemoving =
                      removingMember === user._id;

                    return (
                      <div
                        key={user._id || index}
                        className="group flex items-center justify-between gap-6 px-6 py-5 transition hover:bg-slate-50/70 sm:px-8"
                      >
                        <div className="flex min-w-0 items-center gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                            {user.name
                              ?.charAt(0)
                              .toUpperCase() || "U"}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {user.name || "Unknown user"}
                            </p>

                            <p className="mt-0.5 truncate text-sm text-slate-500">
                              {user.email || ""}
                            </p>
                          </div>
                        </div>

                        <div className="flex w-56 shrink-0 items-center justify-end gap-3">
                          <span
                            className={`flex h-9 w-24 items-center justify-center rounded-full border text-xs font-semibold ${getRoleBadgeClasses(
                              role
                            )}`}
                          >
                            {getRoleLabel(role)}
                          </span>

                          <div className="relative h-9 w-9 shrink-0">
                            {!isOwner && (
                              <>
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();

                                    setOpenMenu(
                                      openMenu === user._id
                                        ? null
                                        : user._id
                                    );
                                  }}
                                  disabled={isRemoving}
                                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 opacity-0 transition hover:bg-slate-100 hover:text-slate-700 group-hover:opacity-100 focus:opacity-100 disabled:cursor-not-allowed disabled:opacity-50"
                                  aria-label="Member options"
                                >
                                  <MoreVertical size={18} />
                                </button>

                                {openMenu === user._id && (
                                  <div
                                    className="absolute right-0 top-11 z-50 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl"
                                    onClick={(event) =>
                                      event.stopPropagation()
                                    }
                                  >
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleOpenRoleModal(member)
                                      }
                                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                    >
                                      <Shield
                                        size={16}
                                        className="text-slate-400"
                                      />
                                      Change role
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRemoveMember(member)
                                      }
                                      disabled={isRemoving}
                                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                                    >
                                      <Trash2 size={16} />

                                      {isRemoving
                                        ? "Removing..."
                                        : "Remove member"}
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "projects" && (
            <div>
              <div className="flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Workspace projects
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Projects belonging to this workspace.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowCreateProjectModal(true)
                  }
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                >
                  <Plus size={17} />
                  Create project
                </button>
              </div>

              {projects.length === 0 ? (
                <div className="border-t border-slate-100 p-12 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <FolderKanban size={26} />
                  </div>

                  <h3 className="mt-4 text-sm font-semibold text-slate-900">
                    No projects yet
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Create a project to start managing tasks.
                  </p>
                </div>
              ) : (
                <div className="rounded-b-2xl border-t border-slate-100 p-6 sm:p-8">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                      <div
                        key={project._id}
                        onClick={() =>
                          navigate(
                            `/projects/${project._id}`
                          )
                        }
                        className="cursor-pointer rounded-xl border border-slate-200 p-5 transition hover:border-blue-200 hover:shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="min-w-0 truncate pr-2 font-semibold text-slate-900">
                            {project.name}
                          </h3>

                          <div className="relative shrink-0">
                            <button
                              type="button"
                              aria-label="Project options"
                              onClick={(event) => {
                                event.stopPropagation();

                                setOpenMenu(
                                  openMenu === project._id
                                    ? null
                                    : project._id
                                );
                              }}
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            >
                              <MoreVertical size={18} />
                            </button>

                            {openMenu === project._id && (
                              <div
                                className="absolute right-0 top-10 z-50 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl"
                                onClick={(event) =>
                                  event.stopPropagation()
                                }
                              >
                                <button
                                  type="button"
                                  onClick={(event) =>
                                    handleOpenEditProject(
                                      event,
                                      project
                                    )
                                  }
                                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                >
                                  <Pencil
                                    size={16}
                                    className="text-slate-400"
                                  />
                                  Edit project
                                </button>

                                <button
                                  type="button"
                                  onClick={(event) =>
                                    handleOpenDeleteProject(
                                      event,
                                      project
                                    )
                                  }
                                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                                >
                                  <Trash2 size={16} />
                                  Delete project
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                          {project.description ||
                            "No description"}
                        </p>

                        <div className="mt-4">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getProjectStatusBadgeClasses(
                              project.status
                            )}`}
                          >
                            {getProjectStatusLabel(
                              project.status
                            )}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showAddMemberModal && (
        <AddMemberModal
          workspaceId={workspaceId}
          onClose={() =>
            setShowAddMemberModal(false)
          }
          onAdded={async () => {
            setShowAddMemberModal(false);
            await fetchMembers();
          }}
        />
      )}

      {showCreateProjectModal && (
        <CreateProjectModal
          workspaceId={workspaceId}
          onClose={() =>
            setShowCreateProjectModal(false)
          }
          onCreated={(project) => {
            setProjects((current) =>
              [...current, project].sort(
                (a, b) =>
                  new Date(a.createdAt) -
                  new Date(b.createdAt)
              )
            );

            setShowCreateProjectModal(false);
          }}
        />
      )}

      {showEditWorkspaceModal && (
        <EditWorkspaceModal
          workspace={workspace}
          onClose={() =>
            setShowEditWorkspaceModal(false)
          }
          onUpdated={handleWorkspaceUpdated}
        />
      )}

      {showEditProjectModal && selectedProject && (
        <EditProjectModal
          project={selectedProject}
          onClose={() => {
            setShowEditProjectModal(false);
            setSelectedProject(null);
          }}
          onUpdated={handleProjectUpdated}
        />
      )}

      {showDeleteWorkspaceModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm"
          onClick={() => {
            if (!deletingWorkspace) {
              setShowDeleteWorkspaceModal(false);
            }
          }}
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
                  This will permanently delete{" "}
                  <span className="font-semibold text-slate-700">
                    {workspace.name}
                  </span>
                  . This action cannot be undone.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowDeleteWorkspaceModal(false)
                }
                disabled={deletingWorkspace}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>

            <div className="flex justify-end gap-3 px-6 py-5">
              <button
                type="button"
                onClick={() =>
                  setShowDeleteWorkspaceModal(false)
                }
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

      {showDeleteProjectModal && projectToDelete && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm"
          onClick={handleCloseDeleteProjectModal}
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
                  Delete project?
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  This will permanently delete{" "}
                  <span className="font-semibold text-slate-700">
                    {projectToDelete.name}
                  </span>
                  . This action cannot be undone.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseDeleteProjectModal}
                disabled={deletingProject}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>

            <div className="flex justify-end gap-3 px-6 py-5">
              <button
                type="button"
                onClick={handleCloseDeleteProjectModal}
                disabled={deletingProject}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteProject}
                disabled={deletingProject}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingProject && (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                )}

                {deletingProject
                  ? "Deleting..."
                  : "Delete project"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showRoleModal && selectedMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
          onClick={() => {
            if (!updatingRole) {
              setShowRoleModal(false);
            }
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Change member role
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Update the role for{" "}
                  {selectedMember.user?.name ||
                    "this member"}
                  .
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowRoleModal(false)
                }
                disabled={updatingRole}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 px-6 py-6">
              <button
                type="button"
                onClick={() =>
                  setSelectedRole("member")
                }
                className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition ${
                  selectedRole === "member"
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:border-blue-200 hover:bg-slate-50"
                }`}
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Member
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Regular workspace access.
                  </p>
                </div>

                {selectedRole === "member" && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white">
                    <Check size={14} />
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() =>
                  setSelectedRole("manager")
                }
                className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition ${
                  selectedRole === "manager"
                    ? "border-amber-400 bg-amber-50"
                    : "border-slate-200 hover:border-amber-200 hover:bg-slate-50"
                }`}
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Manager
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Higher workspace management access.
                  </p>
                </div>

                {selectedRole === "manager" && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white">
                    <Check size={14} />
                  </div>
                )}
              </button>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-5">
              <button
                type="button"
                onClick={() =>
                  setShowRoleModal(false)
                }
                disabled={updatingRole}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleChangeRole}
                disabled={updatingRole}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updatingRole
                  ? "Updating..."
                  : "Update role"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkspaceDetails;