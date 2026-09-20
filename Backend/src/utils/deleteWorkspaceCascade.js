import Workspace from "../models/workspace.model.js";
import Project from "../models/project.model.js";
import deleteProjectCascade from "./deleteProjectCascade.js";

const deleteWorkspaceCascade = async (workspaceId) => {
    const projects = await Project.find({
        workspace: workspaceId,
    }).select("_id");

    for (const project of projects) {
        await deleteProjectCascade(project._id);
    }

    await Workspace.findByIdAndDelete(workspaceId);
};

export default deleteWorkspaceCascade;