import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, FolderKanban, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createProject } from "../services/projectService";

const projectSchema = z
  .object({
    name: z
      .string()
      .min(2, "Project name must be at least 2 characters")
      .max(100, "Project name cannot exceed 100 characters"),

    description: z
      .string()
      .max(500, "Description cannot exceed 500 characters")
      .optional(),

    startDate: z.string().optional(),

    dueDate: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.dueDate) return true;

      return new Date(data.dueDate) >= new Date(data.startDate);
    },
    {
      message: "Due date must be after start date",
      path: ["dueDate"],
    }
  );

function CreateProjectModal({ workspaceId, onClose, onCreated }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      startDate: "",
      dueDate: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const projectData = {
        name: data.name,
        description: data.description || undefined,
        startDate: data.startDate
          ? new Date(data.startDate).toISOString()
          : undefined,
        dueDate: data.dueDate
          ? new Date(data.dueDate).toISOString()
          : undefined,
      };

      const response = await createProject(
        workspaceId,
        projectData
      );

      toast.success("Project created successfully");

      onCreated(response.project);
      onClose();
    } catch (error) {
      console.error(
        "Failed to create project:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to create project"
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FolderKanban size={20} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Create project
              </h2>

              <p className="text-sm text-slate-500">
                Add a new project to this workspace.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={20} />
          </button>

        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-6"
        >
          <div className="space-y-5">

            {/* Name */}
            <div>
              <label
                htmlFor="project-name"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Project name
              </label>

              <input
                id="project-name"
                type="text"
                {...register("name")}
                placeholder="e.g. Website Redesign"
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 focus:ring-blue-500/10 ${
                  errors.name
                    ? "border-red-400 focus:border-red-500"
                    : "border-slate-200 focus:border-blue-500"
                }`}
              />

              {errors.name && (
                <p className="mt-1.5 text-sm text-red-500">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="project-description"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Description
                <span className="ml-1 font-normal text-slate-400">
                  (optional)
                </span>
              </label>

              <textarea
                id="project-description"
                rows={3}
                {...register("description")}
                placeholder="What is this project about?"
                className={`w-full resize-none rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 focus:ring-blue-500/10 ${
                  errors.description
                    ? "border-red-400 focus:border-red-500"
                    : "border-slate-200 focus:border-blue-500"
                }`}
              />

              {errors.description && (
                <p className="mt-1.5 text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Dates */}
            <div className="grid gap-4 sm:grid-cols-2">

              <div>
                <label
                  htmlFor="project-start-date"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Start date
                </label>

                <input
                  id="project-start-date"
                  type="date"
                  {...register("startDate")}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <div>
                <label
                  htmlFor="project-due-date"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Due date
                </label>

                <input
                  id="project-due-date"
                  type="date"
                  {...register("dueDate")}
                  className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:ring-4 focus:ring-blue-500/10 ${
                    errors.dueDate
                      ? "border-red-400 focus:border-red-500"
                      : "border-slate-200 focus:border-blue-500"
                  }`}
                />

                {errors.dueDate && (
                  <p className="mt-1.5 text-sm text-red-500">
                    {errors.dueDate.message}
                  </p>
                )}
              </div>

            </div>
          </div>

          {/* Actions */}
          <div className="mt-7 flex justify-end gap-3">

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
                : "Create project"}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateProjectModal;