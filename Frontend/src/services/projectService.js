import api from "./api";

export const getWorkspaceProjects = async (workspaceId) => {
  const response = await api.get(
    `/workspaces/${workspaceId}/projects`
  );

  return response.data;
};

export const getProject = async (projectId) => {
  const response = await api.get(`/projects/${projectId}`);

  return response.data;
};

export const createProject = async (workspaceId, projectData) => {
  const response = await api.post(
    `/workspaces/${workspaceId}/projects`,
    projectData
  );

  return response.data;
};

export const updateProject = async (projectId, projectData) => {
  const response = await api.patch(
    `/projects/${projectId}`,
    projectData
  );

  return response.data;
};

export const deleteProject = async (projectId) => {
  const response = await api.delete(`/projects/${projectId}`);

  return response.data;
};