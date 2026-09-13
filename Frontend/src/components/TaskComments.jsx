import { useEffect, useState } from "react";
import { MessageSquare, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  getTaskComments,
  createComment,
  deleteComment,
} from "../services/commentService";

function TaskComments({ taskId }) {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await getTaskComments(taskId);
        setComments(response.comments || []);
      } catch (error) {
        console.error(
          "Failed to fetch comments:",
          error.response?.data || error.message
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
      toast.error("Comment cannot be empty.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await createComment(taskId, {
        content: content.trim(),
      });

      setComments((current) => [
        response.comment,
        ...current,
      ]);

      setContent("");
      toast.success("Comment added");
    } catch (error) {
      console.error(
        "Failed to create comment:",
        error.response?.data || error.message
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
    try {
      await deleteComment(commentId);

      setComments((current) =>
        current.filter((comment) => comment._id !== commentId)
      );

      toast.success("Comment deleted");
    } catch (error) {
      console.error(
        "Failed to delete comment:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to delete comment."
      );
    }
  };

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <MessageSquare size={20} />
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Comments
          </h2>

          <p className="text-sm text-slate-500">
            Discuss this task with your team.
          </p>
        </div>
      </div>

      {/* Add comment */}
      <form
        onSubmit={handleSubmit}
        className="mt-6"
      >
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={3}
          maxLength={1000}
          placeholder="Write a comment..."
          className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
        />

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {content.length}/1000
          </span>

          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send size={16} />
            {submitting ? "Posting..." : "Add comment"}
          </button>
        </div>
      </form>

      {/* Comments */}
      <div className="mt-8">
        {loading ? (
          <p className="text-sm text-slate-500">
            Loading comments...
          </p>
        ) : comments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
            <MessageSquare
              size={28}
              className="mx-auto text-slate-400"
            />

            <p className="mt-3 text-sm font-medium text-slate-600">
              No comments yet
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Start the conversation.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment._id}
                className="rounded-xl border border-slate-200 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                      {comment.user?.name
                        ?.charAt(0)
                        .toUpperCase() || "U"}
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {comment.user?.name || "Unknown user"}
                      </p>

                      <p className="text-xs text-slate-400">
                        {new Date(
                          comment.createdAt
                        ).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(comment._id)
                    }
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                    title="Delete comment"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {comment.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskComments;