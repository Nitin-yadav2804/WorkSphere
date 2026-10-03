import { formatDateInput } from "./dates.js";

export const getAssignedUserId = (assignedTo) => {
  if (!assignedTo) {
    return "";
  }

  if (typeof assignedTo === "object" && assignedTo._id) {
    return assignedTo._id;
  }

  if (typeof assignedTo === "string") {
    return assignedTo;
  }

  return "";
};

export const getTaskDefaultValues = (currentTask) => ({
  title: currentTask?.title || "",
  description: currentTask?.description || "",
  assignedTo: getAssignedUserId(currentTask?.assignedTo),
  status: currentTask?.status || "todo",
  priority: currentTask?.priority || "medium",
  dueDate: formatDateInput(currentTask?.dueDate),
});

export const toTaskPayload = (data, { editing = false } = {}) => ({
  title: data.title.trim(),
  description: data.description.trim(),
  assignedTo: data.assignedTo || (editing ? "" : undefined),
  status: data.status,
  priority: data.priority,
  dueDate: data.dueDate ? `${data.dueDate}T00:00:00.000Z` : editing ? null : undefined,
});
