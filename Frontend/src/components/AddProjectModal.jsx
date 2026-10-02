import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, FolderPlus } from "lucide-react";
import { toast } from "sonner";

import { toOptionalISODate } from "../utils/dates.js";
import { addProjectSchema } from "../validators/project.js";
import ModalFrame from "./ui/ModalFrame.jsx";
import { getErrorDetails, getErrorMessage } from "../utils/errors.js";
import FieldError from "./ui/FieldError.jsx";
import { createProject } from "../services/projectService";
import { getWorkspaces } from "../services/workspaceService";

function AddProjectModal({ onClose, onCreated }) {
  const [workspaces, setWorkspaces] = useState([]);
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(addProjectSchema),
    defaultValues: {
      name: "",
      description: "",
      workspaceId: "",
      startDate: "",
      dueDate: "",
    },
  });

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const response = await getWorkspaces();

        setWorkspaces(response.workspaces || []);
      } catch (error) {
        console.error("Failed to fetch workspaces:", getErrorDetails(error));

        toast.error(getErrorMessage(error, "Failed to load workspaces."));
      } finally {
        setLoadingWorkspaces(false);
      }
    };

    fetchWorkspaces();
  }, []);

  const onSubmit = async (data) => {
    try {
      const projectData = {
        name: data.name,
        description: data.description,
        startDate: toOptionalISODate(data.startDate),
        dueDate: toOptionalISODate(data.dueDate),
      };

      const response = await createProject(data.workspaceId, projectData);

      toast.success("Project created successfully");

      onCreated(response.project);
      onClose();
    } catch (error) {
      console.error("Failed to create project:", getErrorDetails(error));

      toast.error(getErrorMessage(error, "Failed to create project."));
    }
  };

  return (
    <ModalFrame
      overlayProps={{
        className:
          "fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4",
      }}
      panelProps={{
        className: "w-full max-w-lg rounded-2xl bg-white shadow-2xl",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <FolderPlus size={20} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">Add project</h2>

            <p className="mt-1 text-sm text-slate-500">
              Create a project inside a workspace.
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
        onSubmit={handleSubmit(onSubmit)}
        className="max-h-[80vh] space-y-5 overflow-y-auto p-6"
      >
        {/* Project Name */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Project name
          </label>

          <input
            type="text"
            {...register("name")}
            placeholder="e.g. WorkSphere Website"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />

          <FieldError
            error={errors.name}
            className="mt-1.5 text-xs text-red-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Description
          </label>

          <textarea
            rows={4}
            {...register("description")}
            placeholder="Describe what this project is about..."
            className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />

          <FieldError
            error={errors.description}
            className="mt-1.5 text-xs text-red-500"
          />
        </div>

        {/* Workspace */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Workspace
          </label>

          <select
            {...register("workspaceId")}
            disabled={loadingWorkspaces}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
          >
            <option value="">
              {loadingWorkspaces
                ? "Loading workspaces..."
                : "Select a workspace"}
            </option>

            {!loadingWorkspaces &&
              workspaces.map((workspace) => (
                <option key={workspace._id} value={workspace._id}>
                  {workspace.name}
                </option>
              ))}
          </select>

          <FieldError
            error={errors.workspaceId}
            className="mt-1.5 text-xs text-red-500"
          />
        </div>

        {/* Dates */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Start date
            </label>

            <input
              type="datetime-local"
              {...register("startDate")}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />

            <FieldError
              error={errors.startDate}
              className="mt-1.5 text-xs text-red-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Due date
            </label>

            <input
              type="datetime-local"
              {...register("dueDate")}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />

            <FieldError
              error={errors.dueDate}
              className="mt-1.5 text-xs text-red-500"
            />
          </div>
        </div>

        {/* Buttons */}
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
            disabled={isSubmitting || loadingWorkspaces}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FolderPlus size={16} />

            {isSubmitting ? "Creating..." : "Create project"}
          </button>
        </div>
      </form>
    </ModalFrame>
  );
}

export default AddProjectModal;
