import { requireDocument } from "../utils/requireDocument.js";
import { requireWorkspaceAccess } from "../utils/workspaceAccess.js";
import Project from "../models/project.model.js";
import createActivity from "../utils/createActivity.js";
import deleteProjectCascade from "../utils/deleteProjectCascade.js";
import { emitProjectUpdate } from "../realtime/socket.js";

export const createProject = async (req, res) => {
    const { workspaceId } = req.params;
    const { name, description, startDate, dueDate } = req.body;

    const workspace = await requireWorkspaceAccess(
        workspaceId,
        req.user.userId,
        { message: "Workspace not found or access denied", statusCode: 404 }
    );

    const project = await Project.create({
        name,
        description,
        workspace: workspaceId,
        createdBy: req.user.userId,
        startDate,
        dueDate,
    });

    await createActivity({
        action: "project_created",
        description: `Created project "${project.name}"`,
        user: req.user.userId,
        workspace: workspace._id,
        project: project._id,
    });
    emitProjectUpdate(project._id, project);

    res.status(201).json({
        success: true,
        message: "Project created successfully",
        project,
    });
};
export const getWorkspaceProjects = async (req, res) => {
    const { workspaceId } = req.params;

    await requireWorkspaceAccess(workspaceId, req.user.userId, {
        message: "Workspace not found or access denied",
        statusCode: 404,
    });

    const projects = await Project.find({
        workspace: workspaceId,
    })
        .populate("createdBy", "name email")
        .populate("workspace", "name")
        .sort({ createdAt: 1 });

    res.status(200).json({
        success: true,
        projects,
    });
};
export const getProject = async (req, res) => {
    const { projectId } = req.params;

    const project = await requireDocument(
        Project.findById(projectId)
            .populate("createdBy", "name email")
            .populate("workspace", "name"),
        "Project not found",
        404
    );

    await requireWorkspaceAccess(project.workspace._id, req.user.userId, {
        message: "Project not found or access denied",
        statusCode: 404,
    });

    res.status(200).json({
        success: true,
        project,
    });
};
export const updateProject = async (req, res) => {
    const { projectId } = req.params;

    const project = await requireDocument(
        Project.findById(projectId),
        "Project not found",
        404
    );

    // Check whether the logged-in user belongs to the workspace
    const workspace = await requireWorkspaceAccess(
        project.workspace,
        req.user.userId,
        { message: "Project not found or access denied", statusCode: 404 }
    );

    const { name, description, status, startDate, dueDate } = req.body;

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

    await createActivity({
        action: "project_updated",
        description: `Updated project "${project.name}"`,
        user: req.user.userId,
        workspace: workspace._id,
        project: project._id,
    });
    emitProjectUpdate(project._id, project);

    res.status(200).json({
        success: true,
        message: "Project updated successfully",
        project,
    });
};

export const deleteProject = async (req, res) => {
    const { projectId } = req.params;

    const project = await requireDocument(
        Project.findById(projectId),
        "Project not found",
        404
    );

    const workspace = await requireWorkspaceAccess(
        project.workspace,
        req.user.userId,
        {
            message: "Project not found or you are not the workspace owner",
            statusCode: 404,
            ownerOnly: true,
        }
    );

    const projectName = project.name;

    await deleteProjectCascade(projectId);

    await createActivity({
        action: "project_deleted",
        description: `Deleted project "${projectName}"`,
        user: req.user.userId,
        workspace: workspace._id,
    });

    res.status(200).json({
        success: true,
        message: "Project deleted successfully",
    });
};
