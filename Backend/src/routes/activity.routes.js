import express from "express";
import { getWorkspaceActivities } from "../controllers/activity.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

router.get(
    "/workspaces/:workspaceId/activities",
    authMiddleware,
    asyncHandler(getWorkspaceActivities)
);

export default router;