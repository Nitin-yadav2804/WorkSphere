import crypto from "crypto";

import File from "../models/file.model.js";
import Project from "../models/project.model.js";
import Task from "../models/task.model.js";
import Workspace from "../models/workspace.model.js";
import AppError from "../utils/AppError.js";
import { getLocalFilePath, getStorageUrl, uploadToStorage } from "../utils/storage.service.js";
import { fileUploadSchema } from "../validators/file.validator.js";

export const uploadFile = async (req, res, next) => {
    try {
        const { workspaceId, projectId, taskId } =
            fileUploadSchema.parse(req.body);

        if (!req.file) {
            throw new AppError("File is required", 400);
        }

        // Check workspace membership
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

        // If project is provided, verify that it belongs to the same workspace
        if (projectId) {
            const project = await Project.findOne({
                _id: projectId,
                workspace: workspaceId,
            });

            if (!project) {
                throw new AppError(
                    "Project not found or does not belong to this workspace",
                    404
                );
            }
        }

        // If task is provided, verify that it belongs
        // to the provided project
        if (taskId) {
            if (!projectId) {
                throw new AppError(
                    "Project ID is required when uploading a task attachment",
                    400
                );
            }

            const task = await Task.findOne({
                _id: taskId,
                project: projectId,
            });

            if (!task) {
                throw new AppError(
                    "Task not found or does not belong to this project",
                    404
                );
            }
        }

        const uniqueId = crypto.randomUUID();

        const safeFileName = req.file.originalname
            .replace(/[^a-zA-Z0-9._-]/g, "_")
            .toLowerCase();

        const storageKey = [
            "workspaces",
            workspaceId,
            projectId
                ? `projects/${projectId}`
                : "workspace",
            taskId
                ? `tasks/${taskId}`
                : null,
            `${uniqueId}-${safeFileName}`,
        ]
            .filter(Boolean)
            .join("/");

        await uploadToStorage({
            key: storageKey,
            body: req.file.buffer,
            contentType: req.file.mimetype,
        });

        const file = await File.create({
            originalName: req.file.originalname,
            storageKey,
            mimeType: req.file.mimetype,
            size: req.file.size,
            uploadedBy: req.user.userId,
            workspace: workspaceId,
            project: projectId || undefined,
            task: taskId || undefined,
        });

        return res.status(201).json({
            success: true,
            message: "File uploaded successfully",
            file,
        });
    } catch (error) {
        next(error);
    }
};

export const getWorkspaceFiles = async (req, res, next) => {
    try {
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

        const files = await File.find({
            workspace: workspaceId,
        })
            .populate("uploadedBy", "name email")
            .populate("project", "name")
            .populate("task", "title")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            files,
        });
    } catch (error) {
        next(error);
    }
};

export const getFileAccess = async (req, res, next) => {
    try {
        const { fileId } = req.params;

        const file = await File.findById(fileId);

        if (!file) {
            throw new AppError("File not found", 404);
        }

        const workspace = await Workspace.findOne({
            _id: file.workspace,
            "members.user": req.user.userId,
        });

        if (!workspace) {
            throw new AppError(
                "You do not have access to this file",
                403
            );
        }

        if (process.env.STORAGE_PROVIDER === "r2") {
            const url = await getStorageUrl(file.storageKey);

            return res.status(200).json({
                success: true,
                url,
            });
        }

        return res.status(200).json({
            success: true,
            url: `/api/files/${file._id}/download`,
        });
    } catch (error) {
        next(error);
    }
};

export const downloadFile = async (req, res, next) => {
    try {
        const { fileId } = req.params;

        const file = await File.findById(fileId);

        if (!file) {
            throw new AppError("File not found", 404);
        }

        const workspace = await Workspace.findOne({
            _id: file.workspace,
            "members.user": req.user.userId,
        });

        if (!workspace) {
            throw new AppError(
                "You do not have access to this file",
                403
            );
        }

        if (process.env.STORAGE_PROVIDER === "r2") {
            throw new AppError(
                "Direct local download is not available when using R2 storage",
                400
            );
        }

        const filePath = getLocalFilePath(file.storageKey);

        return res.download(
            filePath,
            file.originalName,
            (error) => {
                if (error && !res.headersSent) {
                    next(error);
                }
            }
        );
    } catch (error) {
        next(error);
    }
};