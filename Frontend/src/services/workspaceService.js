import api from "./api";

export const getWorkspaces = async () => {
  const response = await api.get("/workspaces");

  return response.data;
};

export const getWorkspace = async (workspaceId) => {
  const response = await api.get(`/workspaces/${workspaceId}`);

  return response.data;
};

export const createWorkspace = async (workspaceData) => {
  const response = await api.post("/workspaces", workspaceData);

  return response.data;
};

export const updateWorkspace = async (workspaceId, workspaceData) => {
  const response = await api.patch(
    `/workspaces/${workspaceId}`,
    workspaceData
  );

  return response.data;
};

export const deleteWorkspace = async (workspaceId) => {
  const response = await api.delete(`/workspaces/${workspaceId}`);

  return response.data;
};