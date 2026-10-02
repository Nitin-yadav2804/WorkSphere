import { io } from "socket.io-client";

const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

let socket;

export const getSocket = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return null;
  }

  if (!socket) {
    socket = io(socketUrl, {
      autoConnect: false,
      auth: { token },
    });
  } else {
    socket.auth = { token };
  }

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
};

export const closeSocket = () => {
  socket?.disconnect();
  socket = null;
};
