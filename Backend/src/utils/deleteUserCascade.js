import Workspace from "../models/workspace.model.js";
import Task from "../models/task.model.js";
import deleteWorkspaceCascade from "./deleteWorkspaceCascade.js";
import Project from "../models/project.model.js";
import Comment from "../models/comment.model.js";
import Activity from "../models/activity.model.js";

const deleteUserCascade = async (userId) => {
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