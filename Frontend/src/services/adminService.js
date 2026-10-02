import api from "./api";

export const getAdminActivities = async () => {
  const response = await api.get("/admin/activity");
  return response.data;
};

export const getAdminDashboard = async () => {
  const response = await api.get("/admin/dashboard");
  return response.data;
};

export const getAdminProject = async (projectId) => {
  const response = await api.get(`/admin/projects/${projectId}`);
  return response.data;
};

export const deleteAdminTask = async (taskId) => {
  const response = await api.delete(`/admin/tasks/${taskId}`);
  return response.data;
};

export const getAdminProjects = async () => {
  const response = await api.get("/admin/projects");
  return response.data;
};

export const deleteAdminProject = async (projectId) => {
  const response = await api.delete(`/admin/projects/${projectId}`);
  return response.data;
};

export const getAdminTask = async (taskId) => {
  const response = await api.get(`/admin/tasks/${taskId}`);
  return response.data;
};

export const getAdminTaskComments = async (taskId) => {
  const response = await api.get(`/admin/tasks/${taskId}/comments`);
  return response.data;
};

export const deleteAdminComment = async (commentId) => {
  const response = await api.delete(`/admin/comments/${commentId}`);
  return response.data;
};

export const getAdminUsers = async (searchTerm) => {
  const endpoint = searchTerm
    ? `/admin/users/search?search=${encodeURIComponent(searchTerm)}`
    : "/admin/users";
  const response = await api.get(endpoint);
  return response.data;
};

export const updateAdminUserRole = async (userId, role) => {
  const response = await api.patch(`/admin/users/${userId}/role`, {
    role,
  });
  return response.data;
};

export const toggleAdminUserStatus = async (userId) => {
  const response = await api.patch(`/admin/users/${userId}/status`);
  return response.data;
};

export const deleteAdminUser = async (userId) => {
  const response = await api.delete(`/admin/users/${userId}`);
  return response.data;
};

export const getAdminWorkspace = async (workspaceId) => {
  const response = await api.get(`/admin/workspaces/${workspaceId}`);
  return response.data;
};

export const getAdminWorkspaces = async () => {
  const response = await api.get("/admin/workspaces");
  return response.data;
};

export const deleteAdminWorkspace = async (workspaceId) => {
  const response = await api.delete(`/admin/workspaces/${workspaceId}`);
  return response.data;
};
