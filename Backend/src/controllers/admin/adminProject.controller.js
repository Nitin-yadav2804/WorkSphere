import Project from "../../models/project.model.js";
import Task from "../../models/task.model.js";
import deleteProjectCascade from "../../utils/deleteProjectCascade.js";

export const getAllProjects = async (req, res) => {
    const projects = await Project.find()
        .populate("workspace", "name")
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 });

    const projectsWithTaskCount = await Promise.all(
        projects.map(async (project) => {
            const taskCount = await Task.countDocuments({
                project: project._id,
            });

            return {
                ...project.toObject(),
                taskCount,
            };
        })
    );

    res.status(200).json({
        success: true,
        projects: projectsWithTaskCount,
    });
};
export const getProjectDetails = async (req, res) => {
    const { projectId } = req.params;

    const project = await Project.findById(projectId)
        .populate("workspace", "name description")
        .populate("createdBy", "name email");

    if (!project) {
        return res.status(404).json({
            success: false,
            message: "Project not found",
        });
    }

    const tasks = await Task.find({
        project: projectId,
    })
        .populate("assignedTo", "name email")
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        project,
        tasks,
    });
};
export const deleteProject = async (req, res) => {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
        return res.status(404).json({
            success: false,
            message: "Project not found",
        });
    }

    await deleteProjectCascade(projectId);

    res.status(200).json({
        success: true,
        message: "Project deleted successfully",
    });
};