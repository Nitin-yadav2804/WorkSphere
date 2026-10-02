import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import asyncHandler from "../utils/asyncHandler.js";
import { createMessageSchema } from "../validators/message.validator.js";
import {
    getConversationMessages,
    createConversationMessage,
    createProjectMessage,
    createWorkspaceMessage,
    getProjectMessages,
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
router.get(
    "/projects/:projectId/messages",
    authMiddleware,
    asyncHandler(getProjectMessages)
);
router.post(
    "/projects/:projectId/messages",
    authMiddleware,
    validate(createMessageSchema),
    asyncHandler(createProjectMessage)
);

router.get('/conversations/:conversationId/messages', authMiddleware, asyncHandler(getConversationMessages));
router.post('/conversations/:conversationId/messages', authMiddleware, validate(createMessageSchema), asyncHandler(createConversationMessage));
export default router;
