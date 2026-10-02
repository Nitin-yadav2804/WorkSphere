import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, FolderKanban } from "lucide-react";
import { toast } from "sonner";

import { toOptionalISODate } from "../utils/dates.js";
import AsyncButton from "./ui/AsyncButton.jsx";
import { createProjectSchema as projectSchema } from "../validators/project.js";
import ModalFrame from "./ui/ModalFrame.jsx";
import { getErrorDetails, getErrorMessage } from "../utils/errors.js";
import FieldError from "./ui/FieldError.jsx";
import { createProject } from "../services/projectService";

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
        startDate: toOptionalISODate(data.startDate),
        dueDate: toOptionalISODate(data.dueDate),
      };

      const response = await createProject(workspaceId, projectData);

      toast.success("Project created successfully");

      onCreated(response.project);
      onClose();
    } catch (error) {
      console.error("Failed to create project:", getErrorDetails(error));

      toast.error(getErrorMessage(error, "Failed to create project"));
    }
  };

  return (
    <ModalFrame
      overlayProps={{
        className:
          "fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm",
      }}
      panelProps={{
        className: "w-full max-w-lg rounded-2xl bg-white shadow-2xl",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <FolderKanban size={20} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">Create project</h2>

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
      <form onSubmit={handleSubmit(onSubmit)} className="p-6">
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

            <FieldError
              error={errors.name}
              className="mt-1.5 text-sm text-red-500"
            />
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

            <FieldError
              error={errors.description}
              className="mt-1.5 text-sm text-red-500"
            />
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

              <FieldError
                error={errors.dueDate}
                className="mt-1.5 text-sm text-red-500"
              />
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

          <AsyncButton
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            busy={isSubmitting}
            busyLabel={"Creating..."}
            spinnerProps={{ size: 17, className: "animate-spin" }}
          >
            {"Create project"}
          </AsyncButton>
        </div>
      </form>
    </ModalFrame>
  );
}

export default CreateProjectModal;
