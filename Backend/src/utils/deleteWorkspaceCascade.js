import { deleteFromStorage } from "./storage.service.js";
import Conversation from "../models/conversation.model.js";
import Notification from "../models/notification.model.js";
import Message from "../models/message.model.js";
import { deleteFiles } from "./deleteFiles.js";
import Workspace from "../models/workspace.model.js";
import Project from "../models/project.model.js";
import deleteProjectCascade from "./deleteProjectCascade.js";

const deleteWorkspaceCascade = async (workspaceId) => {
    const projects = await Project.find({
        workspace: workspaceId,
    }).select("_id");

    for (const project of projects) {
        await deleteProjectCascade(project._id);
    }

    await deleteFiles({ workspace: workspaceId });
    await Message.deleteMany({ workspace: workspaceId });
    await Conversation.deleteMany({ workspace: workspaceId });
    await Notification.deleteMany({ workspace: workspaceId });
    const workspace = await Workspace.findById(workspaceId).select("logoKey");
    if (workspace?.logoKey) await deleteFromStorage(workspace.logoKey);
    await Workspace.findByIdAndDelete(workspaceId);
};

export default deleteWorkspaceCascade;