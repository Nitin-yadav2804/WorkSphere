import { notify } from "../services/notifications.js";
import { requireDocument } from "../utils/requireDocument.js";
import { requireWorkspaceAccess } from "../utils/workspaceAccess.js";
import Task from "../models/task.model.js";
import Project from "../models/project.model.js";
import AppError from "../utils/AppError.js";
import createActivity from "../utils/createActivity.js";
import deleteTaskCascade from "../utils/deleteTaskCascade.js";
import { emitProjectTask } from "../realtime/socket.js";

export const createTask = async (req, res) => {
    const { projectId } = req.params;

    const { title, description, assignedTo, status, priority, dueDate } =
        req.body;

    // Check project
    const project = await requireDocument(
        Project.findById(projectId),
        "Project not found",
        404
    );

    // Check workspace access
    const workspace = await requireWorkspaceAccess(
        project.workspace,
        req.user.userId,
        { message: "Project not found or access denied", statusCode: 404 }
    );

    if (assignedTo) {
        const isWorkspaceMember = workspace.members.some(
            (member) => member.user.toString() === assignedTo
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
        assignedTo: assignedTo || undefined,
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
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');
    if (assignedTo) await notify({ recipients: [assignedTo], actor: req.user.userId, type: 'task_assignment', text: `Assigned to you: ${task.title}`, link: `/tasks/${task._id}`, workspace: workspace._id });
    emitProjectTask(project._id, "created", task);

    res.status(201).json({
        success: true,
        message: "Task created successfully",
        task,
    });
};

export const getProjectTasks = async (req, res) => {
    const { projectId } = req.params;

    const project = await requireDocument(
        Project.findById(projectId),
        "Project not found",
        404
    );

    await requireWorkspaceAccess(project.workspace, req.user.userId, {
        message: "Project not found or access denied",
        statusCode: 404,
    });

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

    const task = await requireDocument(
        Task.findById(taskId)
            .populate("assignedTo", "name email")
            .populate("createdBy", "name email")
            .populate("project", "name"),
        "Task not found",
        404
    );

    await requireWorkspaceAccess(
        (await Project.findById(task.project._id)).workspace,
        req.user.userId,
        { message: "Task not found or access denied", statusCode: 404 }
    );

    res.status(200).json({
        success: true,
        task,
    });
};
export const updateTask = async (req, res) => {
    const { taskId } = req.params;

    const task = await requireDocument(
        Task.findById(taskId),
        "Task not found",
        404
    );

    const project = await requireDocument(
        Project.findById(task.project),
        "Project not found",
        404
    );

    const workspace = await requireWorkspaceAccess(
        project.workspace,
        req.user.userId,
        { message: "Task not found or access denied", statusCode: 404 }
    );

    const { title, description, assignedTo, status, priority, dueDate } =
        req.body;

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

    const previousAssignee = String(task.assignedTo || "");
    if (assignedTo !== undefined && assignedTo) {
        const isWorkspaceMember = workspace.members.some(
            (member) => member.user.toString() === assignedTo
        );

        if (!isWorkspaceMember) {
            throw new AppError(
                "Assigned user is not a member of this workspace",
                400
            );
        }

        task.assignedTo = assignedTo;
    }

    if (assignedTo === "") task.assignedTo = null;
    await task.save();

    await createActivity({
        action: "task_updated",
        description: `Updated task "${task.title}"`,
        user: req.user.userId,
        workspace: workspace._id,
        project: project._id,
        task: task._id,
    });
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');
    if (assignedTo && assignedTo !== previousAssignee) await notify({ recipients: [assignedTo], actor: req.user.userId, type: 'task_assignment', text: `Assigned to you: ${task.title}`, link: `/tasks/${task._id}`, workspace: workspace._id });
    emitProjectTask(project._id, "updated", task);

    res.status(200).json({
        success: true,
        message: "Task updated successfully",
        task,
    });
};

export const deleteTask = async (req, res) => {
    const { taskId } = req.params;

    const task = await requireDocument(
        Task.findById(taskId),
        "Task not found",
        404
    );

    const project = await requireDocument(
        Project.findById(task.project),
        "Project not found",
        404
    );

    const workspace = await requireWorkspaceAccess(
        project.workspace,
        req.user.userId,
        {
            message: "Task not found or you are not the workspace owner",
            statusCode: 404,
            ownerOnly: true,
        }
    );

    await deleteTaskCascade(taskId);
    emitProjectTask(project._id, "deleted", { _id: taskId });

    await createActivity({
        action: "task_deleted",
        description: `Deleted task "${task.title}"`,
        user: req.user.userId,
        workspace: workspace._id,
        project: project._id,
    });

    res.status(200).json({
        success: true,
        message: "Task deleted successfully",
    });
};
