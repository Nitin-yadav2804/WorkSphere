import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  FolderKanban,
  Pencil,
  Trash2,
  AlertTriangle,
  X,
  Loader2,
  CheckSquare,
  User,
  Flag,
  MoreVertical,
} from "lucide-react";
import { toast } from "sonner";

import {
  getProject,
  deleteProject,
} from "../services/projectService";

import {
  getProjectTasks,
  deleteTask,
} from "../services/taskService";

import {
    getProjectFiles,
} from "../services/fileService";

import CreateTaskModal from "../components/CreateTaskModal";
import EditProjectModal from "../components/EditProjectModal";
import EditTaskModal from "../components/EditTaskModal";

import FileUpload from "../components/files/FileUpload";
import FileList from "../components/files/FileList";

function ProjectDetails() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [files, setFiles] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreateTaskModal, setShowCreateTaskModal] =
    useState(false);

  const [showEditProjectModal, setShowEditProjectModal] =
    useState(false);

  const [showDeleteProjectModal, setShowDeleteProjectModal] =
    useState(false);

  const [deletingProject, setDeletingProject] =
    useState(false);

  const [openTaskMenu, setOpenTaskMenu] =
    useState(null);

  const [taskMenuPosition, setTaskMenuPosition] =
    useState(null);

  const [showEditTaskModal, setShowEditTaskModal] =
    useState(false);

  const [selectedTask, setSelectedTask] =
    useState(null);

  const [showDeleteTaskModal, setShowDeleteTaskModal] =
    useState(false);

  const [deletingTask, setDeletingTask] =
    useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getProject(projectId);

        setProject(response.project);

        const tasksResponse =
          await getProjectTasks(projectId);

        const fetchedTasks =
          tasksResponse.tasks || [];

        setTasks(
          [...fetchedTasks].sort(
            (a, b) =>
              new Date(a.createdAt) -
              new Date(b.createdAt)
          )
        );

        const filesResponse = await getProjectFiles(projectId);

        setFiles(filesResponse.files || []);

      } catch (error) {
        console.error(
          "Failed to fetch project:",
          error.response?.data ||
            error.message
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

  const getProjectStatusBadgeClasses = (status) => {
    switch (status) {
      case "active":
        return "border-green-100 bg-green-50 text-green-600";

      case "completed":
        return "border-blue-100 bg-blue-50 text-blue-600";

      case "archived":
        return "border-slate-200 bg-slate-100 text-slate-500";

      default:
        return "border-slate-200 bg-slate-100 text-slate-500";
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

  const getTaskStatusClasses = (status) => {
    switch (status) {
      case "todo":
        return "border-slate-200 bg-slate-50 text-slate-600";

      case "in-progress":
        return "border-blue-100 bg-blue-50 text-blue-600";

      case "completed":
        return "border-green-100 bg-green-50 text-green-600";

      default:
        return "border-slate-200 bg-slate-50 text-slate-600";
    }
  };

  const getTaskStatusLabel = (status) => {
    switch (status) {
      case "todo":
        return "To Do";

      case "in-progress":
        return "In Progress";

      case "completed":
        return "Completed";

      default:
        return status || "Unknown";
    }
  };

  const getTaskPriorityClasses = (priority) => {
    switch (priority) {
      case "urgent":
        return "border-red-100 bg-red-50 text-red-600";

      case "high":
        return "border-orange-100 bg-orange-50 text-orange-600";

      case "medium":
        return "border-blue-100 bg-blue-50 text-blue-600";

      case "low":
        return "border-slate-200 bg-slate-50 text-slate-600";

      default:
        return "border-slate-200 bg-slate-50 text-slate-600";
    }
  };

  const getTaskPriorityLabel = (priority) => {
    if (!priority) {
      return "Not set";
    }

    return (
      priority.charAt(0).toUpperCase() +
      priority.slice(1)
    );
  };

  const handleProjectUpdated = (updatedProject) => {
    setProject((current) => {
      if (!current) {
        return updatedProject;
      }

      return {
        ...current,
        ...updatedProject,
        workspace: current.workspace,
      };
    });

    setShowEditProjectModal(false);

    toast.success("Project updated successfully.");
  };

  const getWorkspaceId = () => {
    if (!project?.workspace) {
      return null;
    }

    if (
      typeof project.workspace === "object" &&
      project.workspace._id
    ) {
      return project.workspace._id;
    }

    if (typeof project.workspace === "string") {
      return project.workspace;
    }

    return null;
  };

  const handleBackToProjects = () => {
    const workspaceId = getWorkspaceId();

    if (!workspaceId) {
      toast.error(
        "Unable to determine the workspace."
      );
      return;
    }

    navigate(`/workspaces/${workspaceId}`);
  };

  const handleDeleteProject = async () => {
    try {
      setDeletingProject(true);

      await deleteProject(projectId);

      toast.success(
        "Project deleted successfully."
      );

      const workspaceId = getWorkspaceId();

      if (workspaceId) {
        navigate(`/workspaces/${workspaceId}`, {
          replace: true,
        });
      } else {
        navigate("/workspaces", {
          replace: true,
        });
      }
    } catch (error) {
      console.error(
        "Failed to delete project:",
        error.response?.data ||
          error.message
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to delete project."
      );

      setDeletingProject(false);
    }
  };

  const handleCloseDeleteModal = () => {
    if (deletingProject) {
      return;
    }

    setShowDeleteProjectModal(false);
  };

  const handleTaskCreated = (task) => {
    setTasks((current) =>
      [...current, task].sort(
        (a, b) =>
          new Date(a.createdAt) -
          new Date(b.createdAt)
      )
    );

    setShowCreateTaskModal(false);

    toast.success(
      "Task created successfully."
    );
  };

  const formatDate = (date) => {
    if (!date) {
      return "Not set";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  const handleTaskClick = (taskId) => {
    setOpenTaskMenu(null);
    setTaskMenuPosition(null);

    navigate(`/tasks/${taskId}`);
  };

  const handleOpenTaskMenu = (
    event,
    taskId
  ) => {
    event.stopPropagation();

    if (openTaskMenu === taskId) {
      setOpenTaskMenu(null);
      setTaskMenuPosition(null);
      return;
    }

    const buttonRect =
      event.currentTarget.getBoundingClientRect();

    const menuWidth = 150;
    const menuHeight = 92;
    const gap = 8;
    const viewportPadding = 8;

    const spaceBelow =
      window.innerHeight -
      buttonRect.bottom;

    const spaceAbove =
      buttonRect.top;

    const shouldOpenUp =
      spaceBelow <
        menuHeight + gap &&
      spaceAbove >=
        menuHeight + gap;

    let top;

    if (shouldOpenUp) {
      top =
        buttonRect.top -
        menuHeight -
        gap;
    } else {
      top =
        buttonRect.bottom +
        gap;
    }

    let left =
      buttonRect.right -
      menuWidth;

    if (left < viewportPadding) {
      left = viewportPadding;
    }

    if (
      left + menuWidth >
      window.innerWidth -
        viewportPadding
    ) {
      left =
        window.innerWidth -
        menuWidth -
        viewportPadding;
    }

    if (top < viewportPadding) {
      top = viewportPadding;
    }

    if (
      top + menuHeight >
      window.innerHeight -
        viewportPadding
    ) {
      top =
        window.innerHeight -
        menuHeight -
        viewportPadding;
    }

    setTaskMenuPosition({
      top,
      left,
    });

    setOpenTaskMenu(taskId);
  };

  const handleEditTask = (
    event,
    task
  ) => {
    event.stopPropagation();

    setOpenTaskMenu(null);
    setTaskMenuPosition(null);

    setSelectedTask(task);
    setShowEditTaskModal(true);
  };

  const handleDeleteTask = (
    event,
    task
  ) => {
    event.stopPropagation();

    setOpenTaskMenu(null);
    setTaskMenuPosition(null);

    setSelectedTask(task);
    setShowDeleteTaskModal(true);
  };

  const handleTaskUpdated = (
    updatedTask
  ) => {
    setTasks((current) =>
      current.map((task) => {
        if (
          task._id !==
          updatedTask?._id
        ) {
          return task;
        }

        return {
          ...task,
          ...updatedTask,
          assignedTo:
            updatedTask?.assignedTo &&
            typeof updatedTask.assignedTo ===
              "object"
              ? updatedTask.assignedTo
              : task.assignedTo,
          createdBy: task.createdBy,
        };
      })
    );

    setSelectedTask(null);
    setShowEditTaskModal(false);

    toast.success(
      "Task updated successfully."
    );
  };

  const handleConfirmDeleteTask =
    async () => {
      if (!selectedTask?._id) {
        return;
      }

      try {
        setDeletingTask(true);

        await deleteTask(
          selectedTask._id
        );

        setTasks((current) =>
          current.filter(
            (task) =>
              task._id !==
              selectedTask._id
          )
        );

        toast.success(
          "Task deleted successfully."
        );

        setShowDeleteTaskModal(false);
        setSelectedTask(null);
      } catch (error) {
        console.error(
          "Failed to delete task:",
          error.response?.data ||
            error.message
        );

        toast.error(
          error.response?.data?.message ||
            "Failed to delete task."
        );
      } finally {
        setDeletingTask(false);
      }
    };

  const handleCloseDeleteTaskModal =
    () => {
      if (deletingTask) {
        return;
      }

      setShowDeleteTaskModal(false);
      setSelectedTask(null);
    };

  useEffect(() => {
    const handleOutsideClick = () => {
      setOpenTaskMenu(null);
      setTaskMenuPosition(null);
    };

    if (openTaskMenu) {
      document.addEventListener(
        "click",
        handleOutsideClick
      );
    }

    return () => {
      document.removeEventListener(
        "click",
        handleOutsideClick
      );
    };
  }, [openTaskMenu]);

  useEffect(() => {
    const closeMenuOnScroll = () => {
      setOpenTaskMenu(null);
      setTaskMenuPosition(null);
    };

    const closeMenuOnResize = () => {
      setOpenTaskMenu(null);
      setTaskMenuPosition(null);
    };

    if (openTaskMenu) {
      window.addEventListener(
        "scroll",
        closeMenuOnScroll,
        true
      );

      window.addEventListener(
        "resize",
        closeMenuOnResize
      );
    }

    return () => {
      window.removeEventListener(
        "scroll",
        closeMenuOnScroll,
        true
      );

      window.removeEventListener(
        "resize",
        closeMenuOnResize
      );
    };
  }, [openTaskMenu]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <Loader2
              size={20}
              className="animate-spin text-blue-600"
            />

            <p className="text-sm font-medium text-slate-500">
              Loading project...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-7xl">
          <button
            type="button"
            onClick={() =>
              navigate("/workspaces")
            }
            className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
          >
            <ArrowLeft size={18} />
            Back to workspaces
          </button>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <p className="text-sm font-medium text-red-600">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-7xl">
        <button
          type="button"
          onClick={handleBackToProjects}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
        >
          <ArrowLeft size={18} />
          Back to projects
        </button>

        <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <FolderKanban size={22} />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="break-words text-2xl font-bold text-slate-900">
                    {project.name}
                  </h1>

                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${getProjectStatusBadgeClasses(
                      project.status
                    )}`}
                  >
                    {getProjectStatusLabel(
                      project.status
                    )}
                  </span>
                </div>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                  {project.description ||
                    "No description provided."}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 gap-3">
              <button
                type="button"
                onClick={() =>
                  setShowEditProjectModal(
                    true
                  )
                }
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-blue-600"
              >
                <Pencil size={16} />
                Edit project
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowDeleteProjectModal(
                    true
                  )
                }
                className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
              >
                <Trash2 size={16} />
                Delete project
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <CalendarDays size={19} />
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Start date
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {formatDate(
                    project.startDate
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <CalendarDays size={19} />
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Due date
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {formatDate(
                    project.dueDate
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <CheckSquare size={19} />
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Tasks
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {tasks.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-slate-200 bg-white">
              <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                      <h2 className="text-lg font-bold text-slate-900">
                          Project files
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                          Upload and access files shared with this project.
                      </p>
                  </div>

                  <FileUpload
                      workspaceId={project.workspace?._id || project.workspace}
                      projectId={project._id}
                      onUploaded={(uploadedFile) => {
                          setFiles((currentFiles) => [
                              uploadedFile,
                              ...currentFiles,
                          ]);
                      }}
                  />
              </div>

              <div className="p-6">
                  <FileList files={files} />
              </div>
          </div>

        <div className="mt-6 overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Project tasks
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Manage and track tasks belonging to this project.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowCreateTaskModal(
                  true
                )
              }
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              <CheckSquare size={17} />
              Create task
            </button>
          </div>

          {tasks.length === 0 ? (
            <div className="px-6 py-16 text-center sm:px-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
                <CheckSquare size={28} />
              </div>

              <h3 className="mt-5 text-base font-semibold text-slate-900">
                No tasks yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Create your first task to start organizing the work for this project.
              </p>

              <button
                type="button"
                onClick={() =>
                  setShowCreateTaskModal(
                    true
                  )
                }
                className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
              >
                Create your first task
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {tasks.map((task) => (
                <div
                  key={task._id}
                  className="group relative px-6 py-6 transition hover:bg-slate-50 sm:px-8"
                >
                  <button
                    type="button"
                    onClick={() =>
                      handleTaskClick(
                        task._id
                      )
                    }
                    className="block w-full text-left"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex min-w-0 gap-4">
                        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition group-hover:bg-blue-50 group-hover:text-blue-600">
                          <CheckSquare size={19} />
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="break-words text-sm font-bold text-slate-900 group-hover:text-blue-600">
                              {task.title}
                            </h3>

                            <span
                              className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getTaskStatusClasses(
                                task.status
                              )}`}
                            >
                              {getTaskStatusLabel(
                                task.status
                              )}
                            </span>
                          </div>

                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                            {task.description ||
                              "No description provided."}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pr-10 lg:max-w-md lg:justify-end">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${getTaskPriorityClasses(
                            task.priority
                          )}`}
                        >
                          <Flag size={13} />
                          {getTaskPriorityLabel(
                            task.priority
                          )}
                        </span>

                        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500">
                          <User size={13} />

                          {task.assignedTo?.name ||
                            "Unassigned"}
                        </span>

                        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500">
                          <CalendarDays size={13} />

                          {formatDate(
                            task.dueDate
                          )}
                        </span>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={(event) =>
                      handleOpenTaskMenu(
                        event,
                        task._id
                      )
                    }
                    className="absolute right-5 top-6 flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 sm:right-7"
                    aria-label="Task actions"
                  >
                    <MoreVertical size={19} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {openTaskMenu &&
        taskMenuPosition && (
          <div
            style={{
              position: "fixed",
              top: taskMenuPosition.top,
              left: taskMenuPosition.left,
            }}
            onClick={(event) =>
              event.stopPropagation()
            }
            className="z-[100] w-[150px] overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl"
          >
            {(() => {
              const task =
                tasks.find(
                  (item) =>
                    item._id ===
                    openTaskMenu
                );

              if (!task) {
                return null;
              }

              return (
                <>
                  <button
                    type="button"
                    onClick={(event) =>
                      handleEditTask(
                        event,
                        task
                      )
                    }
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-slate-600 transition hover:bg-blue-50 hover:text-blue-600"
                  >
                    <Pencil size={15} />
                    Edit task
                  </button>

                  <button
                    type="button"
                    onClick={(event) =>
                      handleDeleteTask(
                        event,
                        task
                      )
                    }
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    <Trash2 size={15} />
                    Delete task
                  </button>
                </>
              );
            })()}
          </div>
        )}

      {showCreateTaskModal && (
        <CreateTaskModal
          projectId={projectId}
          workspaceId={getWorkspaceId()}
          onClose={() =>
            setShowCreateTaskModal(
              false
            )
          }
          onCreated={handleTaskCreated}
        />
      )}

      {showEditTaskModal &&
        selectedTask && (
          <EditTaskModal
            task={selectedTask}
            workspaceId={getWorkspaceId()}
            onClose={() => {
              setShowEditTaskModal(
                false
              );
              setSelectedTask(null);
            }}
            onUpdated={handleTaskUpdated}
          />
        )}

      {showEditProjectModal && (
        <EditProjectModal
          project={project}
          onClose={() =>
            setShowEditProjectModal(
              false
            )
          }
          onUpdated={
            handleProjectUpdated
          }
        />
      )}

      {showDeleteProjectModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm"
          onClick={
            handleCloseDeleteModal
          }
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
                    {project.name}
                  </span>
                  . This action cannot be undone.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  handleCloseDeleteModal
                }
                disabled={
                  deletingProject
                }
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>

            <div className="flex justify-end gap-3 px-6 py-5">
              <button
                type="button"
                onClick={
                  handleCloseDeleteModal
                }
                disabled={
                  deletingProject
                }
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleDeleteProject
                }
                disabled={
                  deletingProject
                }
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

      {showDeleteTaskModal &&
        selectedTask && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm"
            onClick={
              handleCloseDeleteTaskModal
            }
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
                    Delete task?
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    This will permanently delete{" "}
                    <span className="font-semibold text-slate-700">
                      {selectedTask.title}
                    </span>
                    . This action cannot be undone.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    handleCloseDeleteTaskModal
                  }
                  disabled={
                    deletingTask
                  }
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X size={19} />
                </button>
              </div>

              <div className="flex justify-end gap-3 px-6 py-5">
                <button
                  type="button"
                  onClick={
                    handleCloseDeleteTaskModal
                  }
                  disabled={
                    deletingTask
                  }
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={
                    handleConfirmDeleteTask
                  }
                  disabled={
                    deletingTask
                  }
                  className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deletingTask && (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  )}

                  {deletingTask
                    ? "Deleting..."
                    : "Delete task"}
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

export default ProjectDetails;