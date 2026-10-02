import Task from "../../models/task.model.js";
import Project from "../../models/project.model.js";
import createActivity from "../../utils/createActivity.js";
import { emitTaskComment } from "../../realtime/socket.js";
import Comment from "../../models/comment.model.js";

export const getTaskComments = async (req, res) => {
    const { taskId } = req.params;

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

export const deleteComment = async (req, res) => {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);

    if (!comment) {
        return res.status(404).json({
            success: false,
            message: "Comment not found",
        });
    }

    await Comment.findByIdAndDelete(commentId);
    emitTaskComment(comment.task, 'deleted', { _id: commentId });
    const task = await Task.findById(comment.task);
    const project = task ? await Project.findById(task.project) : null;
    if (project) await createActivity({ action: 'comment_deleted', description: `Administrator removed a comment from "${task.title}"`, user: req.user.userId, workspace: project.workspace, project: project._id, task: task._id });

    res.status(200).json({
        success: true,
        message: "Comment deleted successfully",
    });
};