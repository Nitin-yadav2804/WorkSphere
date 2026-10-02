import Message from "../models/message.model.js";
import { requireWorkspaceAccess } from "../utils/workspaceAccess.js";
import { emitWorkspaceMessage } from "../realtime/socket.js";

export const getWorkspaceMessages = async (req, res) => {
    const { workspaceId } = req.params;

    await requireWorkspaceAccess(workspaceId, req.user.userId, {
        message: "Workspace not found or access denied",
        statusCode: 404,
    });

    const messages = await Message.find({ workspace: workspaceId })
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .limit(100);

    res.status(200).json({
        success: true,
        messages: messages.reverse(),
    });
};

export const createWorkspaceMessage = async (req, res) => {
    const { workspaceId } = req.params;

    await requireWorkspaceAccess(workspaceId, req.user.userId, {
        message: "Workspace not found or access denied",
        statusCode: 404,
    });

    const message = await Message.create({
        content: req.body.content,
        workspace: workspaceId,
        user: req.user.userId,
    });

    await message.populate("user", "name email");
    emitWorkspaceMessage(workspaceId, message);

    res.status(201).json({
        success: true,
        message,
    });
};
