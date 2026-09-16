import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Briefcase, Loader2 } from "lucide-react";
import { updateWorkspace } from "../services/workspaceService";
import { toast } from "sonner";

const workspaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Workspace name must be at least 2 characters")
    .max(100, "Workspace name cannot exceed 100 characters"),

  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
});

function EditWorkspaceModal({
  workspace,
  onClose,
  onUpdated,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: workspace?.name || "",
      description: workspace?.description || "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const response = await updateWorkspace(
        workspace._id,
        {
          name: data.name.trim(),
          description: data.description?.trim() || "",
        }
      );

      toast.success("Workspace updated successfully.");

      onUpdated(response.workspace);
      onClose();
    } catch (error) {
      console.error(
        "Failed to update workspace:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to update workspace."
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Briefcase size={20} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Edit workspace
              </h2>

              <p className="text-sm text-slate-500">
                Update your workspace details.
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

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-6"
        >
          <div className="space-y-5">
            <div>
              <label
                htmlFor="edit-workspace-name"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Workspace name
              </label>

              <input
                id="edit-workspace-name"
                type="text"
                {...register("name")}
                placeholder="e.g. Product Development"
                disabled={isSubmitting}
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 ${
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

            <div>
              <label
                htmlFor="edit-workspace-description"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Description
                <span className="ml-1 font-normal text-slate-400">
                  (optional)
                </span>
              </label>

              <textarea
                id="edit-workspace-description"
                rows={4}
                {...register("description")}
                placeholder="What is this workspace used for?"
                disabled={isSubmitting}
                className={`w-full resize-none rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 ${
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
                ? "Saving..."
                : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditWorkspaceModal;