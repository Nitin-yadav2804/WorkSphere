import api from "./api";

export const getWorkspaceMessages = async (workspaceId) => {
  const response = await api.get(`/workspaces/${workspaceId}/messages`);
  return response.data;
};

export const createWorkspaceMessage = async (workspaceId, content) => {
  const response = await api.post(`/workspaces/${workspaceId}/messages`, {
    content,
  });
  return response.data;
};

export const getProjectMessages = async (projectId) => {
  const response = await api.get(`/projects/${projectId}/messages`);
  return response.data;
};

export const createProjectMessage = async (projectId, content) => {
  const response = await api.post(`/projects/${projectId}/messages`, { content });
  return response.data;
};
