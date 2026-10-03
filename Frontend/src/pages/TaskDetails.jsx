import { getSocket, joinScope } from "../services/socket";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckSquare,
  Pencil,
  Trash2,
  AlertTriangle,
  X,
  CalendarDays,
  User,
  Flag,
  Files,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";

import AsyncButton from "../components/ui/AsyncButton.jsx";
import { formatTaskDate as formatDate } from "../utils/dates.js";
import {
  getTaskStatusLabel as getStatusLabel,
  getTaskStatusClasses as getStatusClasses,
  getPriorityLabel,
  getPriorityClasses,
} from "../utils/presentation.js";
import PageLoading from "../components/ui/PageLoading.jsx";
import ModalFrame from "../components/ui/ModalFrame.jsx";
import { getErrorDetails, getErrorMessage } from "../utils/errors.js";
import { getProject } from "../services/projectService";
import { getTask, deleteTask } from "../services/taskService";
import { getTaskFiles } from "../services/fileService";
import TaskComments from "../components/TaskComments";
import EditTaskModal from "../components/EditTaskModal";
import FileUpload from "../components/files/FileUpload";
import FileList from "../components/files/FileList";

function TaskDetails() {
  const { taskId } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [files, setFiles] = useState([]);
  const [activeTab, setActiveTab] = useState("files");

  const [showEditModal, setShowEditModal] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getTask(taskId);

        const fetchedTask = response?.task;

        if (!fetchedTask) {
          throw new Error("Task data not found.");
        }

        let completeTask = fetchedTask;

        const projectId =
          typeof fetchedTask.project === "object"
            ? fetchedTask.project?._id
            : fetchedTask.project;

        if (projectId) {
          try {
            const projectResponse = await getProject(projectId);

            const fetchedProject = projectResponse?.project;

            if (fetchedProject) {
              completeTask = {
                ...fetchedTask,
                project: {
                  ...fetchedTask.project,
                  ...fetchedProject,
                },
              };
            }
          } catch (projectError) {
            console.error(
              "Failed to fetch project details:",
              getErrorDetails(projectError)
            );
          }
        }

        setTask(completeTask);

        const filesResponse = await getTaskFiles(taskId);

        setFiles(filesResponse.files || []);
      } catch (error) {
        console.error("Failed to fetch task:", getErrorDetails(error));

        setError(
          getErrorMessage(error, error.message) || "Failed to load task."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTaskDetails();
  }, [taskId]);

  useEffect(() => {
    let active = true;
    const socket = getSocket();
    const update = value => { if (String(value._id) === taskId) setTask(current => current ? { ...current, ...value, project: current.project } : current); };
    const refresh = () => getTask(taskId).then(data => { if (active) update(data.task); }).catch(() => {});
    const deleted = value => { if (String(value._id) === taskId) { setError('This task was deleted.'); setShowEditModal(false); } };
    const revoked = value => { if (value.room === `task:${taskId}`) setError('This task is no longer available.'); };
    socket?.on('scope:revoked', revoked);
    const leave = joinScope('task', taskId);
    socket?.on('task:updated', update); socket?.on('task:deleted', deleted); socket?.on('connect', refresh);
    return () => { active = false; leave(); socket?.off('scope:revoked', revoked); socket?.off('task:updated', update); socket?.off('task:deleted', deleted); socket?.off('connect', refresh); };
  }, [taskId]);

  const getProjectId = () => {
    if (!task?.project) {
      return null;
    }

    if (typeof task.project === "object") {
      return task.project?._id || null;
    }

    return task.project;
  };

  const getWorkspaceId = () => {
    const workspace = task?.project?.workspace;

    if (!workspace) {
      return null;
    }

    if (typeof workspace === "object") {
      return workspace?._id || null;
    }

    if (typeof workspace === "string") {
      return workspace;
    }

    return null;
  };

  const handleBackToProject = () => {
    const projectId = getProjectId();

    if (!projectId) {
      toast.error("Unable to determine the project.");
      return;
    }

    navigate(`/projects/${projectId}`);
  };

  const handleTaskUpdated = (updatedTask) => {
    setTask((current) => {
      if (!current) {
        return updatedTask;
      }

      return {
        ...current,
        ...updatedTask,
        project: current.project,
      };
    });

    setShowEditModal(false);

    toast.success("Task updated successfully.");
  };

  const handleDeleteTask = async () => {
    try {
      setDeleting(true);

      await deleteTask(taskId);

      toast.success("Task deleted successfully.");

      const projectId = getProjectId();

      if (projectId) {
        navigate(`/projects/${projectId}`, {
          replace: true,
        });
      } else {
        navigate("/workspaces", {
          replace: true,
        });
      }
    } catch (error) {
      console.error("Failed to delete task:", getErrorDetails(error));

      toast.error(getErrorMessage(error, "Failed to delete task."));

      setDeleting(false);
    }
  };

  const handleCloseDeleteModal = () => {
    if (deleting) {
      return;
    }

    setShowDeleteModal(false);
  };

  if (loading) {
    return <PageLoading variant="task">Loading task...</PageLoading>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-600"
          >
            <ArrowLeft size={18} />
            Go back
          </button>

          <div className="rounded-2xl border border-red-100 bg-red-50 p-8">
            <p className="text-sm font-medium text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!task) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={handleBackToProject}
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-600"
        >
          <ArrowLeft size={18} />
          Back to project
        </button>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <CheckSquare size={26} />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Task details
                </p>

                <h1 className="mt-1 break-words text-2xl font-bold text-slate-900 sm:text-3xl">
                  {task.title}
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                  Created by{" "}
                  <span className="font-medium text-slate-700">
                    {task.createdBy?.name || "Unknown user"}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex shrink-0 gap-3">
              <button
                type="button"
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-blue-600"
              >
                <Pencil size={16} />
                Edit task
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
              >
                <Trash2 size={16} />
                Delete task
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <span
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusClasses(
                task.status
              )}`}
            >
              {getStatusLabel(task.status)}
            </span>

            <span
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${getPriorityClasses(
                task.priority
              )}`}
            >
              {getPriorityLabel(task.priority)}
            </span>
          </div>

          <div className="mt-8">
            <h2 className="text-sm font-semibold text-slate-900">
              Description
            </h2>

            <div className="mt-3 rounded-xl bg-slate-50 p-5">
              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {task.description || "No description provided."}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-slate-400">
                <CheckSquare size={16} />

                <p className="text-xs font-medium uppercase tracking-wide">
                  Status
                </p>
              </div>

              <p className="mt-3 text-sm font-semibold text-slate-900">
                {getStatusLabel(task.status)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-slate-400">
                <Flag size={16} />

                <p className="text-xs font-medium uppercase tracking-wide">
                  Priority
                </p>
              </div>

              <p className="mt-3 text-sm font-semibold text-slate-900">
                {getPriorityLabel(task.priority)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-slate-400">
                <User size={16} />

                <p className="text-xs font-medium uppercase tracking-wide">
                  Assigned to
                </p>
              </div>

              <p className="mt-3 truncate text-sm font-semibold text-slate-900">
                {task.assignedTo?.name || "Unassigned"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-slate-400">
                <CalendarDays size={16} />

                <p className="text-xs font-medium uppercase tracking-wide">
                  Due date
                </p>
              </div>

              <p className="mt-3 text-sm font-semibold text-slate-900">
                {formatDate(task.dueDate)}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Project
            </p>

            <button
              type="button"
              onClick={handleBackToProject}
              className="mt-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
            >
              {task.project?.name || "Unknown project"}
            </button>
          </div>
        </div>

        <div className="mt-8 flex gap-2 border-b border-slate-200" role="tablist" aria-label="Task sections">
          {[{ id: "files", label: "Files", icon: Files }, { id: "comments", label: "Comments", icon: MessageSquare }].map(({ id, label, icon: Icon }) => (
            <button key={id} id={`task-tab-${id}`} type="button" role="tab" aria-selected={activeTab === id} aria-controls={`task-panel-${id}`} onClick={() => setActiveTab(id)} className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${activeTab === id ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-900"}`}><Icon size={17} />{label}{id === "files" && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{files.length}</span>}</button>
          ))}
        </div>
        <div hidden={activeTab !== "files"} role="tabpanel" id="task-panel-files" aria-labelledby="task-tab-files" className="mt-6 w-full rounded-xl border border-slate-200 bg-white">
          <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Task files</h2>

              <p className="mt-1 text-sm text-slate-500">
                Upload and access files attached to this task.
              </p>
            </div>

            <FileUpload
              workspaceId={
                task.project?.workspace?._id || task.project?.workspace
              }
              projectId={task.project?._id || task.project}
              taskId={task._id}
              onUploaded={(uploadedFile) => {
                setFiles((currentFiles) => [uploadedFile, ...currentFiles]);
              }}
            />
          </div>

          <div className="p-6">
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

        <div hidden={activeTab !== "comments"} role="tabpanel" id="task-panel-comments" aria-labelledby="task-tab-comments">
          <TaskComments workspaceId={getWorkspaceId()} taskId={taskId} />
        </div>

        {showEditModal && (
          <EditTaskModal
            task={task}
            workspaceId={getWorkspaceId()}
            onClose={() => setShowEditModal(false)}
            onUpdated={handleTaskUpdated}
          />
        )}

        {showDeleteModal && (
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
                  Delete task?
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  This will permanently delete{" "}
                  <span className="font-semibold text-slate-700">
                    {task.title}
                  </span>
                  . This action cannot be undone.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseDeleteModal}
                disabled={deleting}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>

            <div className="flex justify-end gap-3 px-6 py-5">
              <button
                type="button"
                onClick={handleCloseDeleteModal}
                disabled={deleting}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <AsyncButton
                type="button"
                onClick={handleDeleteTask}
                disabled={deleting}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                busy={deleting}
                busyLabel={"Deleting..."}
                spinnerProps={{ size: 17, className: "animate-spin" }}
              >
                {"Delete Task"}
              </AsyncButton>
            </div>
          </ModalFrame>
        )}
      </div>
    </div>
  );
}

export default TaskDetails;
