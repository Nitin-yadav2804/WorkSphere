import { getAllowedOrigins } from '../config/origins.js';
import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import User from '../models/user.model.js';
import { authorizeScope, sendMessage } from '../services/chat.js';
import { events, publish } from './events.js';
let io;
const ack = (callback, result) => {
  if (typeof callback === 'function') callback(result);
};
const splitRoom = room => {
  const [kind, id] = room.split(':');
  return {
    kind,
    id
  };
};
export function initializeSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: getAllowedOrigins(),
      credentials: true
    }
  });
  io.use(async (socket, next) => {
    try {
      const decoded = jwt.verify(socket.handshake.auth?.token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('name isActive');
      if (!user?.isActive) throw new Error();
      socket.user = {
        ...decoded,
        name: user.name
      };
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });
  const deliver = async ({
    room,
    event,
    data
  }) => {
    const {
      kind,
      id
    } = splitRoom(room);
    const sockets = await io.in(room).fetchSockets();
    for (const socket of sockets) {
      try {
        const account = await User.findById(socket.user.userId).select('isActive');
        if (!account?.isActive) {
          socket.disconnect(true);
          continue;
        }
        if (kind !== 'user') await authorizeScope(kind, id, socket.user.userId);
        socket.emit(event, data);
      } catch {
        socket.leave(room);
        socket.emit('scope:revoked', {
          room
        });
      }
    }
  };
  const listener = payload => {
    deliver(payload).catch(error => console.error('Realtime delivery failed', error.message));
  };
  events.on('publish', listener);
  io.engine.on('close', () => events.off('publish', listener));
  const presence = async room => {
    const sockets = await io.in(room).fetchSockets();
    const users = [...new Map(sockets.map(s => [String(s.user.userId), {
      _id: s.user.userId,
      name: s.user.name
    }])).values()];
    publish(room, 'chat:presence', {
      room,
      users,
      onlineCount: users.length
    });
  };
  io.on('connection', socket => {
    socket.use(async (_packet, next) => {
      try {
        const account = await User.findById(socket.user.userId).select('isActive');
        if (!account?.isActive) {
          socket.disconnect(true);
          return;
        }
        next();
      } catch {
        next(new Error('Unable to authorize event'));
      }
    });
    socket.join(`user:${socket.user.userId}`);
    const scopeVersions = new Map();
    const expiry = setTimeout(() => socket.disconnect(true), Math.min(2147483647, Math.max(0, socket.user.exp * 1000 - Date.now())));
    for (const kind of ['workspace', 'project', 'task', 'conversation']) {
      socket.on(`join:${kind}`, async (id, callback) => {
        const key = `${kind}:${id}`;
        const version = (scopeVersions.get(key) || 0) + 1;
        scopeVersions.set(key, version);
        try {
          const {
            room
          } = await authorizeScope(kind, id, socket.user.userId);
          if (!socket.connected || scopeVersions.get(key) !== version) return ack(callback, {
            success: false,
            message: 'Subscription cancelled'
          });
          await socket.join(room);
          ack(callback, {
            success: true
          });
          await presence(room);
        } catch {
          ack(callback, {
            success: false,
            message: 'Access denied'
          });
        }
      });
      socket.on(`leave:${kind}`, async id => {
        const room = `${kind}:${id}`;
        scopeVersions.set(room, (scopeVersions.get(room) || 0) + 1);
        await socket.leave(room);
        publish(room, 'chat:typing', {
          room,
          userId: socket.user.userId,
          isTyping: false
        });
        await presence(room);
      });
    }
    socket.on('chat:send', async (input = {}, callback) => {
      try {
        const kind = input.kind || (input.projectId ? 'project' : 'workspace');
        const id = input.id || input.projectId || input.workspaceId;
        const message = await sendMessage(kind, id, socket.user.userId, input);
        ack(callback, {
          success: true,
          message
        });
      } catch (error) {
        ack(callback, {
          success: false,
          message: error.statusCode ? error.message : 'Unable to send message'
        });
      }
    });
    socket.on('chat:typing', async (input = {}) => {
      try {
        const kind = input.kind || 'workspace',
          id = input.id || input.workspaceId;
        const {
          room
        } = await authorizeScope(kind, id, socket.user.userId);
        if (!socket.rooms.has(room)) return;
        publish(room, 'chat:typing', {
          room,
          userId: socket.user.userId,
          name: socket.user.name,
          isTyping: Boolean(input.isTyping)
        });
      } catch {/* Unauthorized typing is ignored. */}
    });
    socket.on('disconnecting', () => {
      socket.data.previousRooms = [...socket.rooms].filter(room => /^(workspace|project|conversation):/.test(room));
    });
    socket.on('disconnect', () => {
      clearTimeout(expiry);
      for (const room of socket.data.previousRooms || []) {
        publish(room, 'chat:typing', {
          room,
          userId: socket.user.userId,
          isTyping: false
        });
        presence(room).catch(() => {});
      }
    });
  });
  return io;
}
export const emitTaskComment = (id, event, comment) => publish(`task:${id}`, `comment:${event}`, {
  ...(comment.toObject?.() || comment),
  task: id
});
export const emitWorkspaceMessage = (id, message) => publish(`workspace:${id}`, 'chat:message', message);
export const emitWorkspaceActivity = (id, activity) => publish(`workspace:${id}`, 'activity:created', activity);
export const emitProjectMessage = (id, message) => publish(`project:${id}`, 'chat:message', message);
export const emitProjectTask = (id, event, task) => {
  const value = {
    ...(task.toObject?.() || task),
    project: id
  };
  publish(`project:${id}`, `project:task:${event}`, value);
  if (task._id) publish(`task:${task._id}`, `task:${event}`, value);
};
export const emitProjectUpdate = (id, project) => publish(`project:${id}`, 'project:updated', project);
