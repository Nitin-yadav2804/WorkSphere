import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { X, CheckSquare, User } from "lucide-react";
import { toast } from "sonner";

import {
  toTaskPayload,
  getAssignedUserId,
  getTaskDefaultValues as getDefaultValues,
} from "../utils/taskForm.js";
import AsyncButton from "./ui/AsyncButton.jsx";
import TaskStatusFields from "./TaskStatusFields.jsx";
import { normalizeMembers } from "../utils/members.js";
import ModalFrame from "./ui/ModalFrame.jsx";
import { getErrorDetails, getErrorMessage } from "../utils/errors.js";
import FieldError from "./ui/FieldError.jsx";
import { updateTask } from "../services/taskService";
import { getWorkspaceMembers } from "../services/workspaceService";

function EditTaskModal({ task, workspaceId, onClose, onUpdated }) {
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: getDefaultValues(task),
  });

  useEffect(() => {
    reset(getDefaultValues(task));
  }, [task, reset]);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!workspaceId) {
        console.error("EditTaskModal: workspaceId is missing");
        return;
      }

      try {
        setLoadingMembers(true);

        const response = await getWorkspaceMembers(workspaceId);

        const normalizedMembers = normalizeMembers(response?.members);

        setMembers(normalizedMembers);

        reset({
          ...getDefaultValues(task),
          assignedTo: getAssignedUserId(task?.assignedTo),
        });
      } catch (error) {
        console.error(
          "Failed to fetch workspace members:",
          getErrorDetails(error)
        );

        setMembers([]);

        toast.error(
          getErrorMessage(error, "Failed to load workspace members.")
        );
      } finally {
        setLoadingMembers(false);
      }
    };

    fetchMembers();
  }, [workspaceId, task, reset]);

  const onSubmit = async (data) => {
    if (!task?._id) {
      console.error("EditTaskModal: task is missing", task);

      toast.error("Unable to update task. Task data is missing.");

      return;
    }

    try {
      setSubmitting(true);

      const taskData = toTaskPayload(data);

      const response = await updateTask(task._id, taskData);

      const updatedTask = response?.task;

      if (updatedTask) {
        if (data.assignedTo) {
          const selectedMember = members.find(
            (member) => member?.user?._id === data.assignedTo
          );

          if (selectedMember?.user) {
            updatedTask.assignedTo = selectedMember.user;
          }
        } else {
          updatedTask.assignedTo = null;
        }
      }

      onUpdated(updatedTask);
    } catch (error) {
      console.error("Failed to update task:", getErrorDetails(error));

      toast.error(getErrorMessage(error, "Failed to update task."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalFrame
      overlayProps={{
        className:
          "fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 px-4 py-6 backdrop-blur-sm",
        onClick: onClose,
      }}
      panelProps={{
        className:
          "max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl",
        onClick: (event) => event.stopPropagation(),
      }}
    >
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <CheckSquare size={19} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">Edit task</h2>

            <p className="mt-0.5 text-sm text-slate-500">
              Update task details and assignment.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X size={19} />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 px-6 py-6">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Task title
          </label>

          <input
            type="text"
            {...register("title", {
              required: "Task title is required",
              minLength: {
                value: 2,
                message: "Task title must be at least 2 characters",
              },
            })}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            placeholder="Enter task title"
          />

          <FieldError
            error={errors.title}
            className="mt-1.5 text-xs font-medium text-red-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Description
          </label>

          <textarea
            rows={4}
            {...register("description")}
            className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            placeholder="Describe the task..."
          />
        </div>

        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <User size={16} />
            Assigned to
          </label>

          <select
            {...register("assignedTo")}
            disabled={loadingMembers}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
          >
            <option value="">
              {loadingMembers ? "Loading members..." : "Unassigned"}
            </option>

            {members.map((member) => (
              <option key={member.user._id} value={member.user._id}>
                {member.user.name}
                {member.user.email ? ` (${member.user.email})` : ""}
              </option>
            ))}
          </select>

          {!loadingMembers && members.length === 0 && (
            <p className="mt-2 text-xs text-amber-600">
              No members found in this workspace.
            </p>
          )}
        </div>

        <TaskStatusFields register={register} />

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Due date
          </label>

          <input
            type="date"
            {...register("dueDate")}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />

          <FieldError
            error={errors.dueDate}
            className="mt-1.5 text-xs text-red-500"
          />
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <AsyncButton
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            busy={submitting}
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

export default EditTaskModal;
