import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Briefcase, Loader2 } from "lucide-react";
import { createWorkspace } from "../services/workspaceService";
import { toast } from "sonner";

const workspaceSchema = z.object({
  name: z
    .string()
    .min(2, "Workspace name must be at least 2 characters")
    .max(100, "Workspace name cannot exceed 100 characters"),

  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
});

function CreateWorkspaceModal({ onClose, onCreated }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const response = await createWorkspace(data);

      toast.success("Workspace created successfully");

      onCreated(response.workspace);
      onClose();
    } catch (error) {
      console.error(
        "Failed to create workspace:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message || "Failed to create workspace"
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
              <Briefcase size={20} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Create workspace
              </h2>

              <p className="text-sm text-slate-500">
                Set up a space for your team.
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
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="space-y-5">
            {/* Name */}
            <div>
              <label
                htmlFor="workspace-name"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Workspace name
              </label>

              <input
                id="workspace-name"
                type="text"
                {...register("name")}
                placeholder="e.g. Product Development"
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
                htmlFor="workspace-description"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Description
                <span className="ml-1 font-normal text-slate-400">
                  (optional)
                </span>
              </label>

              <textarea
                id="workspace-description"
                rows={4}
                {...register("description")}
                placeholder="What is this workspace used for?"
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
              {isSubmitting && <Loader2 size={17} className="animate-spin" />}
              {isSubmitting ? "Creating..." : "Create workspace"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateWorkspaceModal;