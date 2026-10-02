const dateOptions = { day: "numeric", month: "short", year: "numeric" };

export const formatDate = (
  date,
  { fallback = "Not set", validate = true } = {}
) => {
  if (!date) return fallback;
  const parsedDate = new Date(date);
  if (validate && Number.isNaN(parsedDate.getTime())) return fallback;
  return parsedDate.toLocaleDateString("en-IN", dateOptions);
};

export const formatDashboardDate = (date) =>
  formatDate(date, { fallback: "No due date" });
export const formatTaskDate = (date) => formatDate(date);
// Project details previously displayed Invalid Date for malformed values.
export const formatProjectDate = (date) =>
  formatDate(date, { validate: false });

// Admin pages use the browser locale and its default date/time options.
export const formatLocaleDate = (date) => new Date(date).toLocaleDateString();
export const formatLocaleDateTime = (date) => new Date(date).toLocaleString();
export const toOptionalISODate = (date) =>
  date ? new Date(date).toISOString() : undefined;
export const toUTCDateInput = (date) =>
  date ? new Date(date).toISOString().split("T")[0] : "";

export const formatRelativeTime = (date) => {
  if (!date) {
    return "";
  }

  const now = new Date();
  const activityDate = new Date(date);

  const diffInSeconds = Math.floor((now - activityDate) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);

  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);

  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;
  }

  return activityDate.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const formatCommentDate = (date) => {
  if (!date) {
    return "";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};

export const formatDateInput = (date) => {
  if (!date) {
    return "";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  const year = parsedDate.getFullYear();

  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");

  const day = String(parsedDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};
