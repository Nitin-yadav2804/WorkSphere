import Project from "../../models/project.model.js";
import createActivity from "../../utils/createActivity.js";
import { emitProjectTask } from "../../realtime/socket.js";
import Task from "../../models/task.model.js";
import deleteTaskCascade from "../../utils/deleteTaskCascade.js";

export const getTaskDetails = async (req, res) => {
    const { taskId } = req.params;

    const task = await Task.findById(taskId)
        .populate("project", "name")
        .populate("assignedTo", "name email")
        .populate("createdBy", "name email");

    if (!task) {
        return res.status(404).json({
            success: false,
            message: "Task not found",
        });
    }

    res.status(200).json({
        success: true,
        task,
    });
};

export const deleteTask = async (req, res) => {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
        return res.status(404).json({
            success: false,
            message: "Task not found",
        });
    }

    await deleteTaskCascade(taskId);
    emitProjectTask(task.project, 'deleted', { _id: taskId });
    const project = await Project.findById(task.project);
    if (project) await createActivity({ action: 'task_deleted', description: `Administrator deleted task "${task.title}"`, user: req.user.userId, workspace: project.workspace, project: project._id });

    res.status(200).json({
        success: true,
        message: "Task deleted successfully",
    });
};