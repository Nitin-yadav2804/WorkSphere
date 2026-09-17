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
        recentActivity,
    });
};