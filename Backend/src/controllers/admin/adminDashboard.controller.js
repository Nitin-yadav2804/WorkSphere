import User from "../../models/user.model.js";
import Workspace from "../../models/workspace.model.js";
import Project from "../../models/project.model.js";
import Task from "../../models/task.model.js";
import Activity from "../../models/activity.model.js";

export const getAdminDashboard = async (req, res) => {
    const totalUsers = await User.countDocuments();
    const totalWorkspaces = await Workspace.countDocuments();
    const totalProjects = await Project.countDocuments();
    const totalTasks = await Task.countDocuments();

    const todoTasks = await Task.countDocuments({
        status: "todo",
    });

    const inProgressTasks = await Task.countDocuments({
        status: "in-progress",
    });

    const completedTasks = await Task.countDocuments({
        status: "completed",
    });

    const activeProjects = await Project.countDocuments({
        status: "active",
    });

    const completedProjects = await Project.countDocuments({
        status: "completed",
    });

    const archivedProjects = await Project.countDocuments({
        status: "archived",
    });

    const recentActivity = await Activity.find()
        .populate("user", "name email")
        .populate("workspace", "name")
        .populate("project", "name")
        .populate("task", "title")
        .sort({ createdAt: -1 })
        .limit(10);

    res.status(200).json({
        success: true,

        stats: {
            totalUsers,
            totalWorkspaces,
            totalProjects,
            totalTasks,
        },

        taskStats: {
            todo: todoTasks,
            inProgress: inProgressTasks,
            completed: completedTasks,
        },

        projectStats: {
            active: activeProjects,
            completed: completedProjects,
            archived: archivedProjects,
        },

        recentActivity,
    });
};