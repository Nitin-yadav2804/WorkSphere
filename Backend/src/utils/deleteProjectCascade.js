import Message from "../models/message.model.js";
import { deleteFiles } from "./deleteFiles.js";
import Project from "../models/project.model.js";
import Task from "../models/task.model.js";
import deleteTaskCascade from "./deleteTaskCascade.js";

const deleteProjectCascade = async (projectId) => {
    const tasks = await Task.find({
        project: projectId,
    }).select("_id");

    for (const task of tasks) {
        await deleteTaskCascade(task._id);
    }

    await deleteFiles({ project: projectId });
    await Message.deleteMany({ project: projectId });
    await Project.findByIdAndDelete(projectId);
};

export default deleteProjectCascade;