import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { deleteFiles } from "./deleteFiles.js";
import { deleteFromStorage } from "./storage.service.js";
import Workspace from "../models/workspace.model.js";
import Task from "../models/task.model.js";
import deleteWorkspaceCascade from "./deleteWorkspaceCascade.js";
import Project from "../models/project.model.js";
import Comment from "../models/comment.model.js";
import Activity from "../models/activity.model.js";

const deleteUserCascade = async (userId) => {
    const user = await User.findById(userId).select('avatarKey');
    if (user?.avatarKey) await deleteFromStorage(user.avatarKey);
    await deleteFiles({ uploadedBy: userId });
    await Notification.deleteMany({ recipient: userId });
    const conversations = await Conversation.find({ participants: userId }).select('_id');
    await Message.deleteMany({ conversation: { $in: conversations.map(c => c._id) } });
    await Conversation.deleteMany({ participants: userId });
    const ownedWorkspaces = await Workspace.find({
        owner: userId,
    }).select("_id");

    for (const workspace of ownedWorkspaces) {
        await deleteWorkspaceCascade(workspace._id);
    }

    await Workspace.updateMany(
        {
            "members.user": userId,
        },
        {
            $pull: {
                members: {
                    user: userId,
                },
            },
        }
    );

    await Task.updateMany(
        {
            assignedTo: userId,
        },
        {
            $set: {
                assignedTo: null,
            },
        }
    );

    const projectsCreatedByUser = await Project.find({
        createdBy: userId,
    }).select("_id workspace");

    for (const project of projectsCreatedByUser) {
        const workspace = await Workspace.findById(project.workspace).select("owner");

        if (workspace && workspace.owner.toString() !== userId.toString()) {
            await Project.findByIdAndUpdate(project._id, {
                createdBy: workspace.owner,
            });
        }
    }

    const tasksCreatedByUser = await Task.find({
        createdBy: userId,
    }).select("_id project");

    for (const task of tasksCreatedByUser) {
        const project = await Project.findById(task.project).select(
            "workspace"
        );

        if (!project) {
            continue;
        }

        const workspace = await Workspace.findById(project.workspace).select(
            "owner"
        );

        if (workspace && workspace.owner.toString() !== userId.toString()) {
            await Task.findByIdAndUpdate(task._id, {
                createdBy: workspace.owner,
            });
        }
    }

    await Comment.deleteMany({
        user: userId,
    });

    await Activity.deleteMany({
        user: userId,
    });
};

export default deleteUserCascade;