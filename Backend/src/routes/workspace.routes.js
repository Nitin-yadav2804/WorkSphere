import express from "express";
import {
    addMember,
    createWorkspace,
    deleteWorkspace,
    getMyWorkspaces,
    getWorkspace,
    getWorkspaceMembers,
    removeMember,
    updateMemberRole,
    updateWorkspace,
} from "../controllers/workspace.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import {
    createWorkspaceSchema,
} from "../validators/workspace.validator.js";
import asyncHandler from "../utils/asyncHandler.js";
import { addMemberSchema, updateMemberRoleSchema } from "../validators/member.validator.js";

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    validate(createWorkspaceSchema),
    asyncHandler(createWorkspace)
);
router.get(
    "/",
    authMiddleware,
    asyncHandler(getMyWorkspaces)
);
router.get(
    "/:workspaceId",
    authMiddleware,
    asyncHandler(getWorkspace)
);
router.patch(
    "/:workspaceId",
    authMiddleware,
    validate(createWorkspaceSchema),
    asyncHandler(updateWorkspace)
);
router.delete(
    "/:workspaceId",
    authMiddleware,
    asyncHandler(deleteWorkspace)
);
router.post(
    "/:workspaceId/members",
    authMiddleware,
    validate(addMemberSchema),
    asyncHandler(addMember)
);
router.get(
    "/:workspaceId/members",
    authMiddleware,
    asyncHandler(getWorkspaceMembers)
);
router.delete(
    "/:workspaceId/members/:userId",
    authMiddleware,
    asyncHandler(removeMember)
);
router.patch(
    "/:workspaceId/members/:userId",
    authMiddleware,
    validate(updateMemberRoleSchema),
    asyncHandler(updateMemberRole)
);

export default router;