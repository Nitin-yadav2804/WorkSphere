import Project from "../models/project.model.js";
import Workspace from "../models/workspace.model.js";
import AppError from "../utils/AppError.js";

export const createProject = async (req, res) => {
    const { workspaceId } = req.params;
    const { name, description, startDate, dueDate } = req.body;

    const workspace = await Workspace.findOne({
        _id: workspaceId,
        "members.user": req.user.userId,
    });

    if (!workspace) {
        throw new AppError(
            "Workspace not found or access denied",
            404
        );
    }

    const project = await Project.create({
        name,
        description,
        workspace: workspaceId,
        createdBy: req.user.userId,
        startDate,
        dueDate,
    });

    res.status(201).json({
        success: true,
        message: "Project created successfully",
        project,
    });
};
export const getWorkspaceProjects = async (req, res) => {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findOne({
        _id: workspaceId,
        "members.user": req.user.userId,
    });

    if (!workspace) {
        throw new AppError(
            "Workspace not found or access denied",
            404
        );
    }

    const projects = await Project.find({
        workspace: workspaceId,
    })
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        projects,
    });
};
export const getProject = async (req, res) => {
    const { projectId } = req.params;

    const project = await Project.findById(projectId)
        .populate("createdBy", "name email")
        .populate("workspace", "name");

    if (!project) {
        throw new AppError("Project not found", 404);
    }

    const workspace = await Workspace.findOne({
        _id: project.workspace._id,
        "members.user": req.user.userId,
    });

    if (!workspace) {
        throw new AppError(
            "Project not found or access denied",
            404
        );
    }

    res.status(200).json({
        success: true,
        project,
    });
};
export const updateProject = async (req, res) => {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
        throw new AppError("Project not found", 404);
    }

    // Check whether the logged-in user belongs to the workspace
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

    const {
        name,
        description,
        status,
        startDate,
        dueDate,
    } = req.body;

    if (name !== undefined) {
        project.name = name;
    }

    if (description !== undefined) {
        project.description = description;
    }

    if (status !== undefined) {
        project.status = status;
    }

    if (startDate !== undefined) {
        project.startDate = startDate;
    }

    if (dueDate !== undefined) {
        project.dueDate = dueDate;
    }

    await project.save();

    res.status(200).json({
        success: true,
        message: "Project updated successfully",
        project,
    });
};

export const deleteProject = async (req, res) => {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
        throw new AppError("Project not found", 404);
    }

    const workspace = await Workspace.findOne({
        _id: project.workspace,
        owner: req.user.userId,
    });

    if (!workspace) {
        throw new AppError(
            "Project not found or you are not the workspace owner",
            404
        );
    }

    await Project.findByIdAndDelete(projectId);

    res.status(200).json({
        success: true,
        message: "Project deleted successfully",
    });
};