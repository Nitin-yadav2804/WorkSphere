import api from "./api";

export const getWorkspaceActivities = async (
  workspaceId,
  params = {}
) => {
  const response = await api.get(
    `/workspaces/${workspaceId}/activities`,
    {
      params,
    }
  );

  return response.data;
};