import express from "express";
import {
    createProject,
    deleteProject,
    getProject,
    getWorkspaceProjects,
    updateProject,
} from "../controllers/project.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import {
    createProjectSchema,
    updateProjectSchema,
} from "../validators/project.validator.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

router.post(
    "/workspaces/:workspaceId/projects",
    authMiddleware,
    validate(createProjectSchema),
    asyncHandler(createProject)
);
router.get(
    "/workspaces/:workspaceId/projects",
    authMiddleware,
    asyncHandler(getWorkspaceProjects)
);
router.get(
    "/projects/:projectId",
    authMiddleware,
    asyncHandler(getProject)
);
router.patch(
    "/projects/:projectId",
    authMiddleware,
    validate(updateProjectSchema),
    asyncHandler(updateProject)
);
router.delete(
    "/projects/:projectId",
    authMiddleware,
    asyncHandler(deleteProject)
);

export default router;