import { createSlice } from "@reduxjs/toolkit";

const storedToken = localStorage.getItem("token");

const initialState = {
  user: null,
  token: storedToken,
  isAuthenticated: Boolean(storedToken),
};

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },

    logout: (state) => {
      localStorage.removeItem("token");

      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;