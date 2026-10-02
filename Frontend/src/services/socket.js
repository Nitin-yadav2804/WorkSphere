import { io } from 'socket.io-client';
let socket;
const rooms = new Map();
export const getSocket = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    closeSocket();
    return null;
  }
  if (socket && socket.auth.token !== token) closeSocket();
  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
      autoConnect: false,
      auth: {
        token
      }
    });
    socket.on('connect', () => {
      for (const key of rooms.keys()) {
        const [kind, id] = key.split(':');
        socket.emit(`join:${kind}`, id);
      }
    });
  }
  if (!socket.connected) socket.connect();
  return socket;
};
export const joinScope = (kind, id) => {
  const current = getSocket();
  if (!current || !id) return () => {};
  const key = `${kind}:${id}`;
  rooms.set(key, (rooms.get(key) || 0) + 1);
  if (current.connected) current.emit(`join:${kind}`, id);
  return () => {
    const count = (rooms.get(key) || 1) - 1;
    if (count) rooms.set(key, count);else {
      rooms.delete(key);
      current.emit(`leave:${kind}`, id);
    }
  };
};
export function closeSocket() {
  socket?.disconnect();
  socket = null;
  rooms.clear();
}
