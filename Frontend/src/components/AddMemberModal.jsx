import { useState } from "react";
import { X, UserPlus, Check } from "lucide-react";
import { toast } from "sonner";
import { addWorkspaceMember } from "../services/workspaceService";

function AddMemberModal({
  workspaceId,
  onClose,
  onAdded,
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim()) {
      toast.error("Email address is required.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await addWorkspaceMember(
        workspaceId,
        {
          email: email.trim(),
          role,
        }
      );

      toast.success("Member added successfully");

      onAdded(response.member);
      onClose();
    } catch (error) {
      console.error(
        "Failed to add member:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to add member."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <UserPlus size={20} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Add member
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Add a registered user to this workspace.
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-6"
        >
          {/* Email */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Email address
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="e.g. teammate@example.com"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />

            <p className="mt-2 text-xs text-slate-400">
              The user must already have a WorkSphere account.
            </p>
          </div>

          {/* Role */}
          <div>
            <label className="mb-3 block text-sm font-semibold text-slate-700">
              Workspace role
            </label>

            <div className="space-y-3">

              {/* Member */}
              <button
                type="button"
                onClick={() => setRole("member")}
                className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition ${
                  role === "member"
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

                {role === "member" && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white">
                    <Check size={14} />
                  </div>
                )}
              </button>

              {/* Manager */}
              <button
                type="button"
                onClick={() => setRole("manager")}
                className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition ${
                  role === "manager"
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:border-blue-200 hover:bg-slate-50"
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

                {role === "manager" && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white">
                    <Check size={14} />
                  </div>
                )}
              </button>

            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <UserPlus size={16} />

              {submitting
                ? "Adding..."
                : "Add member"}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}

export default AddMemberModal;