import { requireDocument } from "../utils/requireDocument.js";
import { requireWorkspaceAccess } from "../utils/workspaceAccess.js";
import Comment from "../models/comment.model.js";
import Task from "../models/task.model.js";
import Project from "../models/project.model.js";
import Workspace from "../models/workspace.model.js";
import AppError from "../utils/AppError.js";
import createActivity from "../utils/createActivity.js";
import { emitTaskComment } from "../realtime/socket.js";

export const createComment = async (req, res) => {
    const { taskId } = req.params;
    const { content } = req.body;

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

    const comment = await Comment.create({
        content,
        task: taskId,
        user: req.user.userId,
    });

    await comment.populate("user", "name email");
    emitTaskComment(taskId, "created", comment);

    await createActivity({
        action: "comment_created",
        description: `Added a comment to task "${task.title}"`,
        user: req.user.userId,
        workspace: workspace._id,
        project: project._id,
        task: task._id,
    });

    res.status(201).json({
        success: true,
        message: "Comment added successfully",
        comment,
    });
};

export const getTaskComments = async (req, res) => {
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

    await requireWorkspaceAccess(project.workspace, req.user.userId, {
        message: "Task not found or access denied",
        statusCode: 404,
    });

    const comments = await Comment.find({
        task: taskId,
    })
        .populate("user", "name email")
        .sort({ createdAt: 1 });

    res.status(200).json({
        success: true,
        comments,
    });
};

export const updateComment = async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    const comment = await requireDocument(
        Comment.findById(commentId),
        "Comment not found",
        404
    );

    if (comment.user.toString() !== req.user.userId) {
        throw new AppError("You can only edit your own comments", 403);
    }

    comment.content = content;

    await comment.save();

    await comment.populate("user", "name email");
    emitTaskComment(comment.task, "updated", comment);

    const task = await Task.findById(comment.task);
    const project = await Project.findById(task.project);
    const workspace = await Workspace.findById(project.workspace);

    await createActivity({
        action: "comment_updated",
        description: `Updated a comment on task "${task.title}"`,
        user: req.user.userId,
        workspace: workspace._id,
        project: project._id,
        task: task._id,
    });

    res.status(200).json({
        success: true,
        message: "Comment updated successfully",
        comment,
    });
};

export const deleteComment = async (req, res) => {
    const { commentId } = req.params;

    const comment = await requireDocument(
        Comment.findById(commentId),
        "Comment not found",
        404
    );

    if (comment.user.toString() !== req.user.userId) {
        throw new AppError("You can only delete your own comments", 403);
    }

    const task = await requireDocument(
        Task.findById(comment.task),
        "Task not found",
        404
    );

    const project = await requireDocument(
        Project.findById(task.project),
        "Project not found",
        404
    );

    const workspace = await requireDocument(
        Workspace.findById(project.workspace),
        "Workspace not found",
        404
    );

    await Comment.findByIdAndDelete(commentId);
    emitTaskComment(task._id, "deleted", { _id: commentId });

    await createActivity({
        action: "comment_deleted",
        description: `Deleted a comment from task "${task.title}"`,
        user: req.user.userId,
        workspace: workspace._id,
        project: project._id,
        task: task._id,
    });

    res.status(200).json({
        success: true,
        message: "Comment deleted successfully",
    });
};
