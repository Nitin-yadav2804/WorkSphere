// Separate palettes preserve the dashboard's existing colors and wording.
const projectClasses = {
  active: "border-green-100 bg-green-50 text-green-600",
  completed: "border-blue-100 bg-blue-50 text-blue-600",
  archived: "border-slate-200 bg-slate-100 text-slate-500",
};
const taskClasses = {
  todo: "border-slate-200 bg-slate-50 text-slate-600",
  "in-progress": "border-blue-100 bg-blue-50 text-blue-600",
  completed: "border-green-100 bg-green-50 text-green-600",
};
const priorityClasses = {
  urgent: "border-red-100 bg-red-50 text-red-600",
  high: "border-orange-100 bg-orange-50 text-orange-600",
  medium: "border-blue-100 bg-blue-50 text-blue-600",
  low: "border-slate-200 bg-slate-50 text-slate-600",
};
const dashboardProjectClasses = {
  completed: "bg-emerald-50 text-emerald-600",
  archived: "bg-slate-100 text-slate-500",
};
const dashboardTaskClasses = {
  completed: "bg-emerald-50 text-emerald-600",
  "in-progress": "bg-blue-50 text-blue-600",
};
const dashboardPriorityClasses = {
  urgent: "bg-red-50 text-red-600",
  high: "bg-orange-50 text-orange-600",
  medium: "bg-amber-50 text-amber-600",
};
const taskLabels = {
  todo: "To Do",
  "in-progress": "In Progress",
  completed: "Completed",
};
const projectLabels = {
  active: "Active",
  completed: "Completed",
  archived: "Archived",
};
const dashboardTaskLabels = {
  "in-progress": "In Progress",
  completed: "Completed",
};
const dashboardProjectLabels = { ...dashboardTaskLabels, archived: "Archived" };
const roleClasses = {
  owner: "bg-indigo-50 text-indigo-600 border-indigo-100",
  manager: "bg-amber-50 text-amber-600 border-amber-100",
};
const roleLabels = { owner: "Owner", manager: "Manager" };
const rolePriorities = { owner: 0, manager: 1 };

const lookup = (values, key, fallback) =>
  typeof key === "string" && Object.hasOwn(values, key)
    ? values[key]
    : fallback;

export const getProjectStatusClasses = (status) =>
  lookup(projectClasses, status, projectClasses.archived);
export const getTaskStatusClasses = (status) =>
  lookup(taskClasses, status, taskClasses.todo);
export const getPriorityClasses = (priority) =>
  lookup(priorityClasses, priority, priorityClasses.low);
export const getProjectStatusLabel = (status) =>
  lookup(projectLabels, status, status || "Unknown");
export const getTaskStatusLabel = (status) =>
  lookup(taskLabels, status, status || "Unknown");
export const getPriorityLabel = (priority, fallback = "Not set") =>
  priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : fallback;

export const getWorkspaceProjectStatusClasses = (status) => {
  const [border, background, text] = getProjectStatusClasses(status).split(" ");
  return `${background} ${text} ${border}`;
};
export const getDashboardProjectStatusClasses = (status) =>
  lookup(dashboardProjectClasses, status, "bg-blue-50 text-blue-600");
export const getDashboardTaskStatusClasses = (status) =>
  lookup(dashboardTaskClasses, status, "bg-slate-100 text-slate-600");
export const getDashboardPriorityClasses = (priority) =>
  lookup(dashboardPriorityClasses, priority, "bg-slate-100 text-slate-500");
export const getDashboardTaskStatusLabel = (status) =>
  lookup(dashboardTaskLabels, status, "Todo");
export const getDashboardProjectStatusLabel = (status) =>
  lookup(dashboardProjectLabels, status, "Active");
export const getDashboardPriorityLabel = (priority) =>
  getPriorityLabel(priority, "Medium");
export const getRoleClasses = (role) =>
  lookup(roleClasses, role, "bg-blue-50 text-blue-600 border-blue-100");
export const getRoleLabel = (role) => lookup(roleLabels, role, "Member");
export const getRolePriority = (role) => lookup(rolePriorities, role, 2);
