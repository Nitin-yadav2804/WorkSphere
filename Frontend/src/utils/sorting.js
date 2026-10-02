export const byCreatedAtAscending = (a, b) =>
  new Date(a.createdAt) - new Date(b.createdAt);

export const byRecentActivity = (a, b) => {
  const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
  const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
  return dateB - dateA;
};
