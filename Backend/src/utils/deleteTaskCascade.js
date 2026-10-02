import { deleteFiles } from "./deleteFiles.js";
import Task from "../models/task.model.js";
import Comment from "../models/comment.model.js";

const deleteTaskCascade = async (taskId) => {
    await Comment.deleteMany({
        task: taskId,
    });

    await deleteFiles({ task: taskId });
    await Task.findByIdAndDelete(taskId);
};

export default deleteTaskCascade;