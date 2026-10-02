import api from "./api";

export const getProfile = async () => {
  const response = await api.get("/auth/profile");

  return response.data;
};

export const login = async (data) => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

export const registerUser = async (data) => {
  const response = await api.post("/auth/register", data);
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await api.patch("/auth/profile", data);
  return response.data;
};

export const changePassword = async (data) => {
  const response = await api.patch("/auth/password", data);
  return response.data;
};
