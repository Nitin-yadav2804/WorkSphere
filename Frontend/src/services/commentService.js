import api from "./api";

export const getTaskComments = async (taskId) => {
  const response = await api.get(`/tasks/${taskId}/comments`);

  return response.data;
};

export const createComment = async (taskId, commentData) => {
  const response = await api.post(
    `/tasks/${taskId}/comments`,
    commentData
  );

  return response.data;
};

export const updateComment = async (commentId, commentData) => {
  const response = await api.patch(
    `/comments/${commentId}`,
    commentData
  );

  return response.data;
};

export const deleteComment = async (commentId) => {
  const response = await api.delete(`/comments/${commentId}`);

  return response.data;
};