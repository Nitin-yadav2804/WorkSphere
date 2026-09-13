import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import { toast } from "sonner";
import { createTask } from "../services/taskService";

const createTaskSchema = z.object({
  title: z
    .string()
    .min(2, "Task title must be at least 2 characters")
    .max(200, "Task title cannot exceed 200 characters"),

  description: z
    .string()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional(),

  status: z.enum(["todo", "in-progress", "completed"]),

  priority: z.enum(["low", "medium", "high", "urgent"]),

  dueDate: z.string().optional(),
});

function CreateTaskModal({ projectId, onClose, onCreated }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      dueDate: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const taskData = {
        ...data,
        dueDate: data.dueDate
          ? new Date(data.dueDate).toISOString()
          : undefined,
      };

      const response = await createTask(projectId, taskData);

      toast.success("Task created successfully");

      onCreated(response.task);
      onClose();
    } catch (error) {
      console.error(
        "Failed to create task:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to create task."
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Create task
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Add a new task to this project.
            </p>
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
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 p-6"
        >
          {/* Title */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Task title
            </label>

            <input
              type="text"
              {...register("title")}
              placeholder="e.g. Design login page"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />

            {errors.title && (
              <p className="mt-1.5 text-xs text-red-500">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Description
            </label>

            <textarea
              rows={4}
              {...register("description")}
              placeholder="Describe what needs to be done..."
              className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />

            {errors.description && (
              <p className="mt-1.5 text-xs text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Status + Priority */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Status
              </label>

              <select
                {...register("status")}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              >
                <option value="todo">To do</option>
                <option value="in-progress">In progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Priority
              </label>

              <select
                {...register("priority")}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Due date
            </label>

            <input
              type="datetime-local"
              {...register("dueDate")}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />

            {errors.dueDate && (
              <p className="mt-1.5 text-xs text-red-500">
                {errors.dueDate.message}
              </p>
            )}
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
              disabled={isSubmitting}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Creating..." : "Create task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTaskModal;
