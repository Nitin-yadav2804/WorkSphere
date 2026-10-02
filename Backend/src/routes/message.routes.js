import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import asyncHandler from "../utils/asyncHandler.js";
import { createMessageSchema } from "../validators/message.validator.js";
import {
    createWorkspaceMessage,
    getWorkspaceMessages,
} from "../controllers/message.controller.js";

const router = express.Router();

router.get(
    "/workspaces/:workspaceId/messages",
    authMiddleware,
    asyncHandler(getWorkspaceMessages)
);
router.post(
    "/workspaces/:workspaceId/messages",
    authMiddleware,
    validate(createMessageSchema),
    asyncHandler(createWorkspaceMessage)
);

export default router;
