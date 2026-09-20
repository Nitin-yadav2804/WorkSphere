import { useEffect, useState } from "react";

import {
  ArrowLeft,
  ClipboardList,
  User,
  Trash2,
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";

import api from "../../services/api";

import { toast } from "sonner";

function AdminTaskDetails() {
  const { taskId } = useParams();

  const navigate = useNavigate();

  const [task, setTask] = useState(null);

  const [comments, setComments] = useState([]);

  const [loading, setLoading] = useState(true);

  const [commentsLoading, setCommentsLoading] = useState(true);

  const fetchTask = async () => {
    try {
      const response = await api.get(
        `/admin/tasks/${taskId}`
      );

      setTask(response.data.task);
    } catch (error) {
      console.error(
        "Failed to fetch task:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to load task"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await api.get(
        `/admin/tasks/${taskId}/comments`
      );

      setComments(response.data.comments);
    } catch (error) {
      console.error(
        "Failed to fetch comments:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to load comments"
      );
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleDeleteComment = async (
    commentId,
    commentAuthor
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete this comment by "${commentAuthor}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await api.delete(
        `/admin/comments/${commentId}`
      );

      toast.success(
        response.data.message ||
          "Comment deleted successfully"
      );

      setComments((currentComments) =>
        currentComments.filter(
          (comment) => comment._id !== commentId
        )
      );
    } catch (error) {
      console.error(
        "Failed to delete comment:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to delete comment"
      );
    }
  };

  useEffect(() => {
    fetchTask();
    fetchComments();
  }, [taskId]);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <p className="text-slate-500">
          Loading task...
        </p>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <button
          onClick={() =>
            navigate("/admin/projects")
          }
          className="mb-6 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft size={16} />
          Back to Projects
        </button>

        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
          <h1 className="text-xl font-semibold text-slate-900">
            Task not found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            The task could not be loaded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Back */}
      <button
        onClick={() =>
          navigate(
            `/admin/projects/${task.project?._id}`
          )
        }
        className="mb-6 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-blue-600 transition hover:text-blue-700"
      >
        <ArrowLeft size={16} />
        Back to Project
      </button>

      {/* Header */}
      <div>
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
          <h1 className="break-words text-2xl font-bold text-slate-900">
            {task.title}
          </h1>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-700">
            {task.status}
          </span>
        </div>

        <p className="mt-2 text-sm text-slate-500 sm:text-base">
          {task.description ||
            "No description provided."}
        </p>
      </div>

      {/* Information Cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:mt-8 md:grid-cols-3">
        {/* Project */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <ClipboardList
              size={20}
              className="shrink-0 text-blue-600"
            />

            <div className="min-w-0">
              <p className="text-sm text-slate-500">
                Project
              </p>

              <p className="mt-1 truncate font-semibold text-slate-900">
                {task.project?.name || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Assigned User */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <User
              size={20}
              className="shrink-0 text-blue-600"
            />

            <div className="min-w-0">
              <p className="text-sm text-slate-500">
                Assigned To
              </p>

              <p className="mt-1 truncate font-semibold text-slate-900">
                {task.assignedTo?.name ||
                  "Unassigned"}
              </p>

              <p className="truncate text-xs text-slate-500">
                {task.assignedTo?.email || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Priority */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Priority
          </p>

          <p className="mt-1 font-semibold capitalize text-slate-900">
            {task.priority || "—"}
          </p>
        </div>
      </div>

      {/* Task Information */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white md:mt-8">
        <div className="border-b border-slate-200 px-4 py-5 sm:px-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Task Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Detailed information about this task.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 md:grid-cols-2">
          {/* Status */}
          <div>
            <p className="text-sm font-medium text-slate-500">
              Status
            </p>

            <p className="mt-1 capitalize text-slate-900">
              {task.status || "—"}
            </p>
          </div>

          {/* Priority */}
          <div>
            <p className="text-sm font-medium text-slate-500">
              Priority
            </p>

            <p className="mt-1 capitalize text-slate-900">
              {task.priority || "—"}
            </p>
          </div>

          {/* Due Date */}
          <div>
            <p className="text-sm font-medium text-slate-500">
              Due Date
            </p>

            <p className="mt-1 text-slate-900">
              {task.dueDate
                ? new Date(
                    task.dueDate
                  ).toLocaleDateString()
                : "No due date"}
            </p>
          </div>

          {/* Created */}
          <div>
            <p className="text-sm font-medium text-slate-500">
              Created
            </p>

            <p className="mt-1 text-slate-900">
              {task.createdAt
                ? new Date(
                    task.createdAt
                  ).toLocaleDateString()
                : "—"}
            </p>
          </div>

          {/* Created By */}
          <div>
            <p className="text-sm font-medium text-slate-500">
              Created By
            </p>

            <p className="mt-1 text-slate-900">
              {task.createdBy?.name || "Unknown"}
            </p>

            <p className="truncate text-xs text-slate-500">
              {task.createdBy?.email || "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white md:mt-8">
        <div className="border-b border-slate-200 px-4 py-5 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Comments
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Manage comments posted on this task.
              </p>
            </div>

            <span className="whitespace-nowrap rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600">
              {comments.length}{" "}
              {comments.length === 1
                ? "comment"
                : "comments"}
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {commentsLoading ? (
            <p className="text-sm text-slate-500">
              Loading comments...
            </p>
          ) : comments.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
              <p className="text-sm text-slate-500">
                No comments on this task.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment._id}
                  className="rounded-lg border border-slate-200 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900">
                        {comment.user?.name ||
                          "Unknown User"}
                      </p>

                      <p className="text-xs text-slate-500">
                        {comment.user?.email || "—"}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        handleDeleteComment(
                          comment._id,
                          comment.user?.name ||
                            "Unknown User"
                        )
                      }
                      className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-100"
                    >
                      <Trash2 size={15} />
                      Delete
                    </button>
                  </div>

                  <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                    {comment.content}
                  </p>

                  <p className="mt-3 text-xs text-slate-400">
                    {comment.createdAt
                      ? new Date(
                          comment.createdAt
                        ).toLocaleString()
                      : "—"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminTaskDetails;