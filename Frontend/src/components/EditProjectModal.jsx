import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { toast } from "sonner";

import { toUTCDateInput } from "../utils/dates.js";
import AsyncButton from "./ui/AsyncButton.jsx";
import { editProjectSchema as projectSchema } from "../validators/project.js";
import ModalFrame from "./ui/ModalFrame.jsx";
import { getErrorDetails, getErrorMessage } from "../utils/errors.js";
import FieldError from "./ui/FieldError.jsx";
import { updateProject } from "../services/projectService";

function EditProjectModal({ project, onClose, onUpdated }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
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
      startDate: toUTCDateInput(project.startDate),
      dueDate: toUTCDateInput(project.dueDate),
    });
  }, [project, reset]);

  const onSubmit = async (data) => {
    try {
      const response = await updateProject(project._id, {
        name: data.name,
        description: data.description || "",
        status: data.status,
        startDate: data.startDate || undefined,
        dueDate: data.dueDate || undefined,
      });

      toast.success("Project updated successfully.");

      onUpdated(response.project);
    } catch (error) {
      console.error("Failed to update project:", getErrorDetails(error));

      toast.error(getErrorMessage(error, "Failed to update project."));
    }
  };

  return (
    <ModalFrame
      overlayProps={{
        className:
          "fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm",
        onClick: onClose,
      }}
      panelProps={{
        className: "w-full max-w-lg rounded-2xl bg-white shadow-2xl",
        onClick: (event) => event.stopPropagation(),
      }}
    >
      <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Edit project</h2>

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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 px-6 py-6">
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

          <FieldError
            error={errors.name}
            className="mt-1.5 text-xs text-red-600"
          />
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

          <FieldError
            error={errors.description}
            className="mt-1.5 text-xs text-red-600"
          />
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
              errors.status ? "border-red-300" : "border-slate-200"
            }`}
          >
            <option value="active">Active</option>

            <option value="completed">Completed</option>

            <option value="archived">Archived</option>
          </select>

          <FieldError
            error={errors.status}
            className="mt-1.5 text-xs text-red-600"
          />
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

          <AsyncButton
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            busy={isSubmitting}
            busyLabel={"Saving..."}
            spinnerProps={{ size: 17, className: "animate-spin" }}
          >
            {"Save changes"}
          </AsyncButton>
        </div>
      </form>
    </ModalFrame>
  );
}

export default EditProjectModal;
