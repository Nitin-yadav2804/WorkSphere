import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  MessageSquare,
  Send,
  Trash2,
  Pencil,
  X,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import {
  getTaskComments,
  createComment,
  updateComment,
  deleteComment,
} from "../services/commentService";

function TaskComments({ taskId }) {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [editingCommentId, setEditingCommentId] =
    useState(null);
  const [editingContent, setEditingContent] =
    useState("");
  const [updatingComment, setUpdatingComment] =
    useState(false);

  const currentUser = useSelector(
    (state) => state.auth.user
  );

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);

        const response =
          await getTaskComments(taskId);

        setComments(response.comments || []);
      } catch (error) {
        console.error(
          "Failed to fetch comments:",
          error.response?.data ||
            error.message
        );

        toast.error(
          error.response?.data?.message ||
            "Failed to load comments."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [taskId]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!content.trim()) {
      return;
    }

    try {
      setSubmitting(true);

      const response =
        await createComment(taskId, {
          content: content.trim(),
        });

      setComments((current) => [
        ...current,
        response.comment,
      ]);

      setContent("");

      toast.success("Comment added");
    } catch (error) {
      console.error(
        "Failed to create comment:",
        error.response?.data ||
          error.message
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to add comment."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this comment?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteComment(commentId);

      setComments((current) =>
        current.filter(
          (comment) =>
            comment._id !== commentId
        )
      );

      toast.success("Comment deleted");
    } catch (error) {
      console.error(
        "Failed to delete comment:",
        error.response?.data ||
          error.message
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to delete comment."
      );
    }
  };

  const handleEdit = (comment) => {
    setEditingCommentId(comment._id);
    setEditingContent(
      comment.content || ""
    );
  };

  const handleCancelEdit = () => {
    if (updatingComment) {
      return;
    }

    setEditingCommentId(null);
    setEditingContent("");
  };

  const handleUpdate = async (commentId) => {
    if (!editingContent.trim()) {
      toast.error("Comment cannot be empty.");
      return;
    }

    try {
      setUpdatingComment(true);

      const response =
        await updateComment(
          commentId,
          {
            content:
              editingContent.trim(),
          }
        );

      setComments((current) =>
        current.map((comment) =>
          comment._id === commentId
            ? {
                ...comment,
                ...response.comment,
              }
            : comment
        )
      );

      setEditingCommentId(null);
      setEditingContent("");

      toast.success("Comment updated");
    } catch (error) {
      console.error(
        "Failed to update comment:",
        error.response?.data ||
          error.message
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to update comment."
      );
    } finally {
      setUpdatingComment(false);
    }
  };

  const isCommentOwner = (comment) => {
    return (
      String(comment?.user?._id) ===
      String(currentUser?._id)
    );
  };

  const formatCommentDate = (date) => {
    if (!date) {
      return "";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }
    );
  };

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <MessageSquare size={19} />
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Comments
          </h2>

          <p className="mt-0.5 text-sm text-slate-500">
            Discuss this task with your team.
          </p>
        </div>
      </div>

      <div className="px-6 py-6">

        <form
          onSubmit={handleSubmit}
          className="border-b border-slate-100 pb-6"
        >
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Add a comment
          </label>

          <textarea
            value={content}
            onChange={(event) =>
              setContent(event.target.value)
            }
            rows={3}
            maxLength={1000}
            placeholder="Write your comment..."
            className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />

          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              disabled={
                submitting ||
                !content.trim()
              }
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={16} />

              {submitting
                ? "Adding..."
                : "Add comment"}
            </button>
          </div>
        </form>

        <div className="pt-6">
          {loading ? (
            <p className="text-sm text-slate-500">
              Loading comments...
            </p>
          ) : comments.length === 0 ? (
            <div className="rounded-xl bg-slate-50 px-5 py-8 text-center">
              <MessageSquare
                size={24}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 text-sm font-medium text-slate-500">
                No comments yet.
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Be the first to add a comment.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {comments.map((comment) => (
                <div
                  key={comment._id}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                        {comment.user?.name
                          ?.charAt(0)
                          ?.toUpperCase() ||
                          "U"}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {comment.user?.name ||
                            "Unknown user"}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">
                          {formatCommentDate(
                            comment.createdAt
                          )}
                        </p>
                      </div>
                    </div>

                    {isCommentOwner(comment) && (
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(comment)
                          }
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                          title="Edit comment"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              comment._id
                            )
                          }
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                          title="Delete comment"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  {editingCommentId ===
                  comment._id ? (
                    <div className="mt-4">
                      <textarea
                        value={editingContent}
                        onChange={(event) =>
                          setEditingContent(
                            event.target.value
                          )
                        }
                        rows={3}
                        maxLength={1000}
                        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      />

                      <div className="mt-2 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={
                            handleCancelEdit
                          }
                          disabled={
                            updatingComment
                          }
                          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <X size={14} />
                          Cancel
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleUpdate(
                              comment._id
                            )
                          }
                          disabled={
                            updatingComment ||
                            !editingContent.trim()
                          }
                          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Check size={14} />

                          {updatingComment
                            ? "Saving..."
                            : "Save"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                      {comment.content}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default TaskComments;