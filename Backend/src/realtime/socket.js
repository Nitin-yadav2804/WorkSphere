import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import Workspace from "../models/workspace.model.js";
import Task from "../models/task.model.js";
import Project from "../models/project.model.js";
import Message from "../models/message.model.js";
import { requireWorkspaceAccess } from "../utils/workspaceAccess.js";

let io;

const getTokenUser = (socket) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
        throw new Error("Authentication required");
    }

    return jwt.verify(token, process.env.JWT_SECRET);
};

const ensureTaskAccess = async (taskId, userId) => {
    const task = await Task.findById(taskId).select("project");
    if (!task) throw new Error("Task not found");

    const project = await Project.findById(task.project).select("workspace");
    if (!project) throw new Error("Project not found");

    await requireWorkspaceAccess(project.workspace, userId, {
        message: "Task not found or access denied",
        statusCode: 403,
    });
};

export const initializeSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: ["http://localhost:5173", process.env.FRONTEND_URL].filter(Boolean),
            credentials: true,
        },
    });

    io.use((socket, next) => {
        try {
            socket.user = getTokenUser(socket);
            next();
        } catch {
            next(new Error("Invalid or expired token"));
        }
    });

    io.on("connection", (socket) => {
        socket.on("join:task", async (taskId, callback) => {
            try {
                await ensureTaskAccess(taskId, socket.user.userId);
                socket.join(`task:${taskId}`);
                callback?.({ success: true });
            } catch (error) {
                callback?.({ success: false, message: error.message });
            }
        });

        socket.on("join:workspace", async (workspaceId, callback) => {
            try {
                await requireWorkspaceAccess(workspaceId, socket.user.userId, {
                    message: "Workspace not found or access denied",
                    statusCode: 403,
                });
                socket.join(`workspace:${workspaceId}`);
                callback?.({ success: true });
            } catch (error) {
                callback?.({ success: false, message: error.message });
            }
        });

        socket.on("chat:send", async ({ workspaceId, content }, callback) => {
            try {
                await requireWorkspaceAccess(workspaceId, socket.user.userId, {
                    message: "Workspace not found or access denied",
                    statusCode: 403,
                });

                const message = await Message.create({
                    content: String(content || "").trim(),
                    workspace: workspaceId,
                    user: socket.user.userId,
                });
                await message.populate("user", "name email");
                emitWorkspaceMessage(workspaceId, message);
                callback?.({ success: true, message });
            } catch (error) {
                callback?.({ success: false, message: error.message });
            }
        });
    });

    return io;
};

export const emitTaskComment = (taskId, event, comment) => {
    io?.to(`task:${taskId}`).emit(`comment:${event}`, comment);
};

export const emitWorkspaceMessage = (workspaceId, message) => {
    io?.to(`workspace:${workspaceId}`).emit("chat:message", message);
};
