import DetailTabs from "../components/ui/DetailTabs.jsx";
import TaskBoard from "../components/TaskBoard";
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
  CheckSquare,
  Files,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";

import { byCreatedAtAscending } from "../utils/sorting.js";
import AsyncButton from "../components/ui/AsyncButton.jsx";
import { formatProjectDate as formatDate } from "../utils/dates.js";
import {
  getProjectStatusClasses as getProjectStatusBadgeClasses,
  getProjectStatusLabel,
} from "../utils/presentation.js";
import PageLoading from "../components/ui/PageLoading.jsx";
import ModalFrame from "../components/ui/ModalFrame.jsx";
import { getErrorDetails, getErrorMessage } from "../utils/errors.js";
import { getProject, deleteProject } from "../services/projectService";
import { getProjectTasks, deleteTask } from "../services/taskService";
import { getProjectFiles } from "../services/fileService";
import CreateTaskModal from "../components/CreateTaskModal";
import EditProjectModal from "../components/EditProjectModal";
import EditTaskModal from "../components/EditTaskModal";
import FileUpload from "../components/files/FileUpload";
import FileList from "../components/files/FileList";
import WorkspaceChat from "../components/WorkspaceChat";
import { getSocket, joinScope } from "../services/socket.js";

function ProjectDetails() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("tasks");
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [files, setFiles] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);

  const [showEditProjectModal, setShowEditProjectModal] = useState(false);

  const [showDeleteProjectModal, setShowDeleteProjectModal] = useState(false);

  const [deletingProject, setDeletingProject] = useState(false);



  const [showEditTaskModal, setShowEditTaskModal] = useState(false);

  const [selectedTask, setSelectedTask] = useState(null);

  const [showDeleteTaskModal, setShowDeleteTaskModal] = useState(false);

  const [deletingTask, setDeletingTask] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getProject(projectId);

        setProject(response.project);

        const tasksResponse = await getProjectTasks(projectId);

        const fetchedTasks = tasksResponse.tasks || [];

        setTasks([...fetchedTasks].sort(byCreatedAtAscending));

        const filesResponse = await getProjectFiles(projectId);

        setFiles(filesResponse.files || []);
      } catch (error) {
        console.error("Failed to fetch project:", getErrorDetails(error));

        setError(getErrorMessage(error, "Failed to load project."));
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return undefined;

    const handleTaskCreated = (task) => {
      if (String(task.project?._id || task.project) !== projectId) return;
      setTasks((current) => {
        if (current.some((item) => item._id === task._id)) return current;
        return [...current, task].sort(byCreatedAtAscending);
      });
    };
    const handleTaskUpdated = (task) => {
      if (String(task.project?._id || task.project) !== projectId) return;
      setTasks((current) => current.map((item) => item._id === task._id ? { ...item, ...task } : item));
    };
    const handleTaskDeleted = ({ _id }) => {
      setTasks((current) => current.filter((item) => item._id !== _id));
    };
    const handleProjectUpdated = (updatedProject) => {
      if (String(updatedProject._id) !== projectId) return;
      setProject((current) => current ? { ...current, ...updatedProject, workspace: current.workspace } : current);
    };

    let active = true;
    const refresh = async () => {
      try { const [p, t] = await Promise.all([getProject(projectId), getProjectTasks(projectId)]); if (active) { setProject(p.project); setTasks(t.tasks.sort(byCreatedAtAscending)); } } catch { /* The page's normal error handling covers access changes. */ }
    };
    socket.on('connect', refresh);
    const leaveScope = joinScope("project", projectId);
    socket.on("project:task:created", handleTaskCreated);
    socket.on("project:task:updated", handleTaskUpdated);
    socket.on("project:task:deleted", handleTaskDeleted);
    socket.on("project:updated", handleProjectUpdated);

    return () => {
      active = false; socket.off("connect", refresh);
      leaveScope();
      socket.off("project:task:created", handleTaskCreated);
      socket.off("project:task:updated", handleTaskUpdated);
      socket.off("project:task:deleted", handleTaskDeleted);
      socket.off("project:updated", handleProjectUpdated);
    };
  }, [projectId]);

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

    if (typeof project.workspace === "object" && project.workspace._id) {
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
      toast.error("Unable to determine the workspace.");
      return;
    }

    navigate(`/workspaces/${workspaceId}`);
  };

  const handleDeleteProject = async () => {
    try {
      setDeletingProject(true);

      await deleteProject(projectId);

      toast.success("Project deleted successfully.");

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
      console.error("Failed to delete project:", getErrorDetails(error));

      toast.error(getErrorMessage(error, "Failed to delete project."));

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
    setTasks((current) => [...current.filter(t => t._id !== task._id), task].sort(byCreatedAtAscending));

    setShowCreateTaskModal(false);

    toast.success("Task created successfully.");
  };

  const handleTaskClick = (taskId) => {

    navigate(`/tasks/${taskId}`);
  };

  const handleEditTask = (event, task) => {
    event.stopPropagation();


    setSelectedTask(task);
    setShowEditTaskModal(true);
  };

  const handleDeleteTask = (event, task) => {
    event.stopPropagation();


    setSelectedTask(task);
    setShowDeleteTaskModal(true);
  };

  const handleTaskUpdated = (updatedTask) => {
    setTasks((current) =>
      current.map((task) => {
        if (task._id !== updatedTask?._id) {
          return task;
        }

        return {
          ...task,
          ...updatedTask,
          assignedTo:
            updatedTask?.assignedTo &&
            typeof updatedTask.assignedTo === "object"
              ? updatedTask.assignedTo
              : task.assignedTo,
          createdBy: task.createdBy,
        };
      })
    );

    setSelectedTask(null);
    setShowEditTaskModal(false);

    toast.success("Task updated successfully.");
  };

  const handleConfirmDeleteTask = async () => {
    if (!selectedTask?._id) {
      return;
    }

    try {
      setDeletingTask(true);

      await deleteTask(selectedTask._id);

      setTasks((current) =>
        current.filter((task) => task._id !== selectedTask._id)
      );

      toast.success("Task deleted successfully.");

      setShowDeleteTaskModal(false);
      setSelectedTask(null);
    } catch (error) {
      console.error("Failed to delete task:", getErrorDetails(error));

      toast.error(getErrorMessage(error, "Failed to delete task."));
    } finally {
      setDeletingTask(false);
    }
  };

  const handleCloseDeleteTaskModal = () => {
    if (deletingTask) {
      return;
    }

    setShowDeleteTaskModal(false);
    setSelectedTask(null);
  };

  if (loading) {
    return <PageLoading variant="project">Loading project...</PageLoading>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-7xl">
          <button
            type="button"
            onClick={() => navigate("/workspaces")}
            className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
          >
            <ArrowLeft size={18} />
            Back to workspaces
          </button>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <p className="text-sm font-medium text-red-600">{error}</p>
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
                    {getProjectStatusLabel(project.status)}
                  </span>
                </div>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                  {project.description || "No description provided."}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 gap-3">
              <button
                type="button"
                onClick={() => setShowEditProjectModal(true)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-blue-600"
              >
                <Pencil size={16} />
                Edit project
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteProjectModal(true)}
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
                  {formatDate(project.startDate)}
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
                  {formatDate(project.dueDate)}
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

        <div className="relative mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <DetailTabs
            scope="project"
            label="Project sections"
            activeTab={activeTab}
            onChange={setActiveTab}
            tabs={[
              { id: "tasks", label: "Tasks", icon: CheckSquare, count: tasks.length },
              { id: "files", label: "Files", icon: Files, count: files.length },
              { id: "chat", label: "Chat", icon: MessageCircle },
            ]}
          />
        {activeTab === 'files' && (
        <div role="tabpanel" id="project-panel-files" aria-labelledby="project-tab-files">
          <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
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
                setFiles((currentFiles) => [uploadedFile, ...currentFiles]);
              }}
            />
          </div>

          <div className="p-6 sm:p-8">
            <FileList
              files={files}
              onDeleted={(fileId) =>
                setFiles((current) =>
                  current.filter((file) => file._id !== fileId)
                )
              }
            />
          </div>
        </div>
        )}

        {activeTab === 'tasks' && <div role="tabpanel" id="project-panel-tasks" aria-labelledby="project-tab-tasks"><TaskBoard tasks={tasks} onOpen={handleTaskClick} onCreate={() => setShowCreateTaskModal(true)} onEdit={handleEditTask} onDelete={handleDeleteTask} onChanged={task => setTasks(current => current.map(t => t._id === task._id ? task : t))} /></div>}

        {activeTab === 'chat' && (
        <div role="tabpanel" id="project-panel-chat" aria-labelledby="project-tab-chat">
          <WorkspaceChat
            workspaceId={project.workspace?._id || project.workspace}
            projectId={project._id}
          />
        </div>
        )}
        </div>
      </div>

      {showCreateTaskModal && (
        <CreateTaskModal
          projectId={projectId}
          workspaceId={getWorkspaceId()}
          onClose={() => setShowCreateTaskModal(false)}
          onCreated={handleTaskCreated}
        />
      )}

      {showEditTaskModal && selectedTask && (
        <EditTaskModal
          task={selectedTask}
          workspaceId={getWorkspaceId()}
          onClose={() => {
            setShowEditTaskModal(false);
            setSelectedTask(null);
          }}
          onUpdated={handleTaskUpdated}
        />
      )}

      {showEditProjectModal && (
        <EditProjectModal
          project={project}
          onClose={() => setShowEditProjectModal(false)}
          onUpdated={handleProjectUpdated}
        />
      )}

      {showDeleteProjectModal && (
        <ModalFrame
          overlayProps={{
            className:
              "fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm",
            onClick: handleCloseDeleteModal,
          }}
          panelProps={{
            className: "w-full max-w-md rounded-2xl bg-white shadow-2xl",
            onClick: (event) => event.stopPropagation(),
          }}
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
              onClick={handleCloseDeleteModal}
              disabled={deletingProject}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X size={19} />
            </button>
          </div>

          <div className="flex justify-end gap-3 px-6 py-5">
            <button
              type="button"
              onClick={handleCloseDeleteModal}
              disabled={deletingProject}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <AsyncButton
              type="button"
              onClick={handleDeleteProject}
              disabled={deletingProject}
              className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              busy={deletingProject}
              busyLabel={"Deleting..."}
              spinnerProps={{ size: 17, className: "animate-spin" }}
            >
              {"Delete project"}
            </AsyncButton>
          </div>
        </ModalFrame>
      )}

      {showDeleteTaskModal && selectedTask && (
        <ModalFrame
          overlayProps={{
            className:
              "fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm",
            onClick: handleCloseDeleteTaskModal,
          }}
          panelProps={{
            className: "w-full max-w-md rounded-2xl bg-white shadow-2xl",
            onClick: (event) => event.stopPropagation(),
          }}
        >
          <div className="flex items-start gap-4 border-b border-slate-100 px-6 py-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <AlertTriangle size={21} />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-bold text-slate-900">Delete task?</h3>

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
              onClick={handleCloseDeleteTaskModal}
              disabled={deletingTask}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X size={19} />
            </button>
          </div>

          <div className="flex justify-end gap-3 px-6 py-5">
            <button
              type="button"
              onClick={handleCloseDeleteTaskModal}
              disabled={deletingTask}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <AsyncButton
              type="button"
              onClick={handleConfirmDeleteTask}
              disabled={deletingTask}
              className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              busy={deletingTask}
              busyLabel={"Deleting..."}
              spinnerProps={{ size: 17, className: "animate-spin" }}
            >
              {"Delete task"}
            </AsyncButton>
          </div>
        </ModalFrame>
      )}
    </div>
  );
}

export default ProjectDetails;
