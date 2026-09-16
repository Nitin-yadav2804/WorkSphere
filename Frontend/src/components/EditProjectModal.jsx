import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateProject } from "../services/projectService";

const projectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(
      2,
      "Project name must be at least 2 characters"
    )
    .max(
      100,
      "Project name cannot exceed 100 characters"
    ),

  description: z
    .string()
    .max(
      500,
      "Description cannot exceed 500 characters"
    )
    .optional(),

  status: z.enum([
    "active",
    "completed",
    "archived",
  ]),

  startDate: z.string().optional(),

  dueDate: z.string().optional(),
});

function EditProjectModal({
  project,
  onClose,
  onUpdated,
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "active",
      startDate: "",
      dueDate: "",
    },
  });

  useEffect(() => {
    if (!project) {
      return;
    }

    reset({
      name: project.name || "",
      description: project.description || "",
      status: project.status || "active",
      startDate: project.startDate
        ? new Date(project.startDate)
            .toISOString()
            .split("T")[0]
        : "",
      dueDate: project.dueDate
        ? new Date(project.dueDate)
            .toISOString()
            .split("T")[0]
        : "",
    });
  }, [project, reset]);

  const onSubmit = async (data) => {
    try {
      const response = await updateProject(
        project._id,
        {
          name: data.name,
          description: data.description || "",
          status: data.status,
          startDate: data.startDate || undefined,
          dueDate: data.dueDate || undefined,
        }
      );

      toast.success(
        "Project updated successfully."
      );

      onUpdated(response.project);
    } catch (error) {
      console.error(
        "Failed to update project:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to update project."
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Edit project
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Update your project details.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={19} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 px-6 py-6"
        >
          <div>
            <label
              htmlFor="project-name"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Project name
            </label>

            <input
              id="project-name"
              type="text"
              {...register("name")}
              className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-blue-100 ${
                errors.name
                  ? "border-red-300 focus:border-red-400"
                  : "border-slate-200 focus:border-blue-500"
              }`}
              placeholder="Enter project name"
            />

            {errors.name && (
              <p className="mt-1.5 text-xs text-red-600">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="project-description"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Description
            </label>

            <textarea
              id="project-description"
              rows={4}
              {...register("description")}
              className={`w-full resize-none rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-blue-100 ${
                errors.description
                  ? "border-red-300 focus:border-red-400"
                  : "border-slate-200 focus:border-blue-500"
              }`}
              placeholder="Describe your project"
            />

            {errors.description && (
              <p className="mt-1.5 text-xs text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="project-status"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Status
            </label>

            <select
              id="project-status"
              {...register("status")}
              className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                errors.status
                  ? "border-red-300"
                  : "border-slate-200"
              }`}
            >
              <option value="active">
                Active
              </option>

              <option value="completed">
                Completed
              </option>

              <option value="archived">
                Archived
              </option>
            </select>

            {errors.status && (
              <p className="mt-1.5 text-xs text-red-600">
                {errors.status.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="project-start-date"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Start date
              </label>

              <input
                id="project-start-date"
                type="date"
                {...register("startDate")}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="project-due-date"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Due date
              </label>

              <input
                id="project-due-date"
                type="date"
                {...register("dueDate")}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
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
                ? "Saving..."
                : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProjectModal;