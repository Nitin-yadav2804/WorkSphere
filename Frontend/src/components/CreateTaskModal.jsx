import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  X,
  Loader2,
  CheckSquare,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { createTask } from "../services/taskService";
import { getWorkspaceMembers } from "../services/workspaceService";

function CreateTaskModal({
  projectId,
  workspaceId,
  onClose,
  onCreated,
}) {
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      assignedTo: "",
      status: "todo",
      priority: "medium",
      dueDate: "",
    },
  });

  useEffect(() => {
    const fetchMembers = async () => {
      if (!workspaceId) {
        setMembers([]);
        setMembersLoading(false);
        return;
      }

      try {
        const response =
          await getWorkspaceMembers(workspaceId);

        const workspaceMembers =
          Array.isArray(response?.members)
            ? response.members
            : [];

        const normalizedMembers =
          workspaceMembers
            .map((member) => {
              if (
                member?.user &&
                typeof member.user === "object"
              ) {
                return {
                  ...member,
                  user: member.user,
                };
              }

              if (
                member?._id &&
                member?.name
              ) {
                return {
                  user: member,
                };
              }

              return null;
            })
            .filter(
              (member) =>
                member?.user?._id
            );

        setMembers(normalizedMembers);
      } catch (error) {
        console.error(
          "Failed to fetch workspace members:",
          error.response?.data ||
            error.message
        );

        setMembers([]);

        toast.error(
          error.response?.data?.message ||
            "Failed to load workspace members."
        );
      } finally {
        setMembersLoading(false);
      }
    };

    fetchMembers();
  }, [workspaceId]);

  const onSubmit = async (data) => {
    try {
      const taskData = {
        title: data.title.trim(),
        description: data.description.trim(),
        assignedTo: data.assignedTo || undefined,
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate
          ? `${data.dueDate}T00:00:00.000Z`
          : undefined,
      };

      const response =
        await createTask(
          projectId,
          taskData
        );

      toast.success(
        "Task created successfully."
      );

      onCreated(response.task);
      onClose();
    } catch (error) {
      console.error(
        "Failed to create task:",
        error.response?.data ||
          error.message
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to create task."
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <CheckSquare size={19} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Create task
              </h2>

              <p className="mt-0.5 text-sm text-slate-500">
                Add a new task to this project.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={19} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 px-6 py-6"
        >
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Task title
            </label>

            <input
              type="text"
              {...register("title", {
                required:
                  "Task title is required",
                minLength: {
                  value: 2,
                  message:
                    "Task title must be at least 2 characters",
                },
                maxLength: {
                  value: 200,
                  message:
                    "Task title cannot exceed 200 characters",
                },
              })}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              placeholder="Enter task title"
            />

            {errors.title && (
              <p className="mt-1.5 text-xs font-medium text-red-500">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Description
            </label>

            <textarea
              rows={4}
              {...register("description", {
                maxLength: {
                  value: 1000,
                  message:
                    "Description cannot exceed 1000 characters",
                },
              })}
              className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              placeholder="Describe the task..."
            />

            {errors.description && (
              <p className="mt-1.5 text-xs font-medium text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <User size={16} />
              Assigned to
            </label>

            <select
              {...register("assignedTo")}
              disabled={membersLoading}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
            >
              <option value="">
                {membersLoading
                  ? "Loading members..."
                  : "Unassigned"}
              </option>

              {members.map((member) => (
                <option
                  key={member.user._id}
                  value={member.user._id}
                >
                  {member.user.name}
                  {member.user.email
                    ? ` (${member.user.email})`
                    : ""}
                </option>
              ))}
            </select>

            {!membersLoading &&
              members.length === 0 && (
                <p className="mt-2 text-xs text-amber-600">
                  No members found in this workspace.
                </p>
              )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Status
              </label>

              <select
                {...register("status")}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              >
                <option value="todo">
                  To Do
                </option>

                <option value="in-progress">
                  In Progress
                </option>

                <option value="completed">
                  Completed
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Priority
              </label>

              <select
                {...register("priority")}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              >
                <option value="low">
                  Low
                </option>

                <option value="medium">
                  Medium
                </option>

                <option value="high">
                  High
                </option>

                <option value="urgent">
                  Urgent
                </option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Due date
            </label>

            <input
              type="date"
              {...register("dueDate")}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting && (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              )}

              {isSubmitting
                ? "Creating..."
                : "Create task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTaskModal;