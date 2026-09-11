import Task from "../models/task.model.js";
import Project from "../models/project.model.js";
import Workspace from "../models/workspace.model.js";
import AppError from "../utils/AppError.js";
import createActivity from "../utils/createActivity.js";

export const createTask = async (req, res) => {
    const { projectId } = req.params;

    const {
        title,
        description,
        assignedTo,
        status,
        priority,
        dueDate,
    } = req.body;

    // Check project
    const project = await Project.findById(projectId);

    if (!project) {
        throw new AppError("Project not found", 404);
    }

    // Check workspace access
    const workspace = await Workspace.findOne({
        _id: project.workspace,
        "members.user": req.user.userId,
    });

    if (!workspace) {
        throw new AppError(
            "Project not found or access denied",
            404
        );
    }

    if (assignedTo) {
        const isWorkspaceMember = workspace.members.some(
            (member) =>
                member.user.toString() === assignedTo
        );

        if (!isWorkspaceMember) {
            throw new AppError(
                "Assigned user is not a member of this workspace",
                400
            );
        }
    }

    const task = await Task.create({
        title,
        description,
        project: projectId,
        assignedTo,
        createdBy: req.user.userId,
        status,
        priority,
        dueDate,
    });

    await createActivity({
        action: "task_created",
        description: `Created task "${task.title}"`,
        user: req.user.userId,
        workspace: workspace._id,
        project: project._id,
        task: task._id,
    });

    res.status(201).json({
        success: true,
        message: "Task created successfully",
        task,
    });
};

export const getProjectTasks = async (req, res) => {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
        throw new AppError("Project not found", 404);
    }

    const workspace = await Workspace.findOne({
        _id: project.workspace,
        "members.user": req.user.userId,
    });

    if (!workspace) {
        throw new AppError(
            "Project not found or access denied",
            404
        );
    }

    const tasks = await Task.find({
        project: projectId,
    })
        .populate("assignedTo", "name email")
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        tasks,
    });
};

export const getTask = async (req, res) => {
    const { taskId } = req.params;

    const task = await Task.findById(taskId)
        .populate("assignedTo", "name email")
        .populate("createdBy", "name email")
        .populate("project", "name");

    if (!task) {
        throw new AppError("Task not found", 404);
    }

    const workspace = await Workspace.findOne({
        _id: (
            await Project.findById(task.project._id)
        ).workspace,
        "members.user": req.user.userId,
    });

    if (!workspace) {
        throw new AppError(
            "Task not found or access denied",
            404
        );
    }

    res.status(200).json({
        success: true,
        task,
    });
};
export const updateTask = async (req, res) => {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
        throw new AppError("Task not found", 404);
    }

    const project = await Project.findById(task.project);

    if (!project) {
        throw new AppError("Project not found", 404);
    }

    const workspace = await Workspace.findOne({
        _id: project.workspace,
        "members.user": req.user.userId,
    });

    if (!workspace) {
        throw new AppError(
            "Task not found or access denied",
            404
        );
    }

    const {
        title,
        description,
        assignedTo,
        status,
        priority,
        dueDate,
    } = req.body;

    if (title !== undefined) {
        task.title = title;
    }

    if (description !== undefined) {
        task.description = description;
    }

    if (status !== undefined) {
        task.status = status;
    }

    if (priority !== undefined) {
        task.priority = priority;
    }

    if (dueDate !== undefined) {
        task.dueDate = dueDate;
    }

    if (assignedTo !== undefined) {
        const isWorkspaceMember = workspace.members.some(
            (member) =>
                member.user.toString() === assignedTo
        );

        if (!isWorkspaceMember) {
            throw new AppError(
                "Assigned user is not a member of this workspace",
                400
            );
        }

        task.assignedTo = assignedTo;
    }

    await task.save();

    await createActivity({
        action: "task_updated",
        description: `Updated task "${task.title}"`,
        user: req.user.userId,
        workspace: workspace._id,
        project: project._id,
        task: task._id,
    });

    res.status(200).json({
        success: true,
        message: "Task updated successfully",
        task,
    });
};

export const deleteTask = async (req, res) => {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
        throw new AppError("Task not found", 404);
    }

    const project = await Project.findById(task.project);

    if (!project) {
        throw new AppError("Project not found", 404);
    }

    const workspace = await Workspace.findOne({
        _id: project.workspace,
        owner: req.user.userId,
    });

    if (!workspace) {
        throw new AppError(
            "Task not found or you are not the workspace owner",
            404
        );
    }

    await Task.findByIdAndDelete(taskId);

    await createActivity({
        action: "task_deleted",
        description: `Deleted task "${task.title}"`,
        user: req.user.userId,
        workspace: workspace._id,
        project: project._id,
        task: task._id,
    });

    res.status(200).json({
        success: true,
        message: "Task deleted successfully",
    });
};